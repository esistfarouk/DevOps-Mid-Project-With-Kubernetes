import { rest } from 'msw';

export const handlers = [
  // Fetch tasks
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, title: 'Test Task', description: 'Test description', completed: false, created_at: new Date().toISOString() }
      ])
    );
  }),

  // Create task
  rest.post('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ id: 2, ...req.body, created_at: new Date().toISOString(), completed: false })
    );
  }),

  // Update task
  rest.put('/api/tasks/1', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ ...req.body, id: 1 }));
  }),

  // Delete task
  rest.delete('/api/tasks/1', (req, res, ctx) => {
    return res(ctx.status(200));
  }),
];
