// src/__tests__/mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, title: 'Test Task 1', description: 'Description 1', completed: false, created_at: '2023-01-01' },
        { id: 2, title: 'Test Task 2', description: 'Description 2', completed: true, created_at: '2023-01-02' }
      ])
    );
  }),
  
  rest.post('/api/tasks', (req, res, ctx) => {
    return res(
      ctx.json({ id: 3, ...req.body }),
      ctx.status(201)
    );
  }),
  
  rest.put('/api/tasks/:id', (req, res, ctx) => {
    return res(
      ctx.json({ ...req.body, id: req.params.id }),
      ctx.status(200)
    );
  }),
  
  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    return res(
      ctx.status(204)
    );
  })
];