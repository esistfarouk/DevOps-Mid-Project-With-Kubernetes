// src/mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  // Default GET /tasks handler
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.json([
        { 
          id: 1, 
          title: 'Test Task', 
          description: 'Test Description', 
          completed: false, 
          created_at: '2023-01-01T00:00:00.000Z' 
        }
      ])
    );
  }),

  // Default POST /tasks handler
  rest.post('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ id: 2, ...req.body })
    );
  }),

  // Default DELETE /tasks/:id handler
  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    return res(ctx.status(204));
  }),

  // Default PUT /tasks/:id handler
  rest.put('/api/tasks/:id', (req, res, ctx) => {
    return res(ctx.json({ ...req.body, id: req.params.id }));
  }),
];