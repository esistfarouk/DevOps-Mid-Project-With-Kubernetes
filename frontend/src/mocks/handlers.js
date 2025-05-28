import { rest } from 'msw';

export const handlers = [
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, title: 'Test Task', description: 'Task description', completed: false, created_at: new Date().toISOString() }
      ])
    );
  }),

  rest.post('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ id: 2, ...req.body, created_at: new Date().toISOString(), completed: false })
    );
  }),
];
