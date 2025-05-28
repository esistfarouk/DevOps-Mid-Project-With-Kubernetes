// src/App.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from './App';

// Mock API server
const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, title: 'Test Task', description: 'Test Description', completed: false, created_at: '2023-01-01' }
      ])
    );
  }),
  rest.post('/api/tasks', (req, res, ctx) => {
    return res(ctx.json({ id: 2, ...req.body }), ctx.status(201));
  }),
  rest.delete('/api/tasks/1', (req, res, ctx) => {
    return res(ctx.status(204));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Task Manager App', () => {
  test('renders the task manager title', () => {
    render(<App />);
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
  });

  test('loads and displays tasks', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  test('can add a new task', async () => {
    render(<App />);
    
    userEvent.type(screen.getByLabelText('Task Title'), 'New Task');
    userEvent.type(screen.getByLabelText('Description'), 'New Description');
    userEvent.click(screen.getByRole('button', { name: /add task/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Task created successfully!')).toBeInTheDocument();
    });
  });

  test('can delete a task', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
    
    userEvent.click(screen.getByRole('button', { name: /delete/i }));
    userEvent.click(screen.getByRole('button', { name: /delete/i, exact: true }));
    
    await waitFor(() => {
      expect(screen.getByText('Task deleted successfully!')).toBeInTheDocument();
    });
  });

  test('shows loading state', async () => {
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.delay(200), ctx.json([]));
      })
    );
    
    render(<App />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });
});