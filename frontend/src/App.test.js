import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw'; // Import rest from msw
import App from './App';
import { server } from './mocks/server';

describe('Task Manager App', () => {
  const user = userEvent.setup();

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });
  afterAll(() => server.close());

  test('renders the task manager title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /task manager/i })).toBeInTheDocument();
  });

  test('loads and displays tasks from API', async () => {
    // Override default handler
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
          ctx.json({ id: 2, title: 'New Task', description: 'New Description' })
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
    // Add a task to delete
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.json([
          { 
            id: 1, 
            title: 'Task to Delete', 
            description: 'Delete me', 
            completed: false, 
            created_at: '2023-01-01T00:00:00.000Z' 
          }
        ]));
      })
    );

    // Mock DELETE response
    server.use(
      rest.delete('/api/tasks/1', (req, res, ctx) => {
        return res(ctx.status(204));
      })
    );

    render(<App />);
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Task to Delete')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete/i, exact: true });
    await user.click(confirmButton);

    // Verify success
    await waitFor(() => {
      expect(screen.getByText(/task deleted successfully/i)).toBeInTheDocument();
      expect(screen.queryByText('Task to Delete')).not.toBeInTheDocument();
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
    }, { timeout: 2000 });
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
    }, { timeout: 2000 });
  });
});