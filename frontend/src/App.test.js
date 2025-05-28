import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { server } from './mocks/server';
import { handlers } from './mocks/handlers';

describe('Task Manager App', () => {
  // Setup user event with delay option for more realistic interactions
  const user = userEvent.setup({ delay: null });

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('renders the task manager title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /task manager/i })).toBeInTheDocument();
  });

  test('loads and displays tasks from API', async () => {
    // Mock API response
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.json([
          { 
            id: 1, 
            title: 'API Task 1', 
            description: 'From API', 
            completed: false, 
            created_at: '2023-01-01T00:00:00.000Z' 
          }
        ]));
      })
    );

    render(<App />);
    
    // Wait for API task to appear
    await waitFor(() => {
      expect(screen.getByText('API Task 1')).toBeInTheDocument();
    });
  });

  test('can add a new task via API', async () => {
    // Mock POST response
    server.use(
      rest.post('/api/tasks', (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({ id: 2, ...req.body })
        );
      })
    );

    render(<App />);
    
    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Fill out form
    await user.type(screen.getByLabelText(/task title/i), 'New Task');
    await user.type(screen.getByLabelText(/description/i), 'New Description');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    // Verify success
    await waitFor(() => {
      expect(screen.getByText(/task created successfully/i)).toBeInTheDocument();
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  test('can delete a task via API', async () => {
    // Mock DELETE response
    server.use(
      rest.delete('/api/tasks/:id', (req, res, ctx) => {
        return res(ctx.status(204));
      })
    );

    render(<App />);
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    // Find task item
    const taskItem = screen.getByText('Test Task').closest('li');
    
    // Click delete button
    const deleteButton = within(taskItem).getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete/i, exact: true });
    await user.click(confirmButton);

    // Verify success
    await waitFor(() => {
      expect(screen.getByText(/task deleted successfully/i)).toBeInTheDocument();
      expect(screen.queryByText('Test Task')).not.toBeInTheDocument();
    });
  });

  test('shows loading state during API calls', async () => {
    // Delay API response
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.delay(100), ctx.json([]));
      })
    );

    render(<App />);
    
    // Should show loading spinner initially
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
    
    // Should disappear after load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  test('shows error when API fails', async () => {
    // Force API error
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<App />);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch tasks/i)).toBeInTheDocument();
    });
  });
});