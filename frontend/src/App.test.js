import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const renderWithTheme = (ui) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {ui}
    </ThemeProvider>
  );
};

test('can edit a task', async () => {
  renderWithTheme(<App />);
  await waitFor(() => screen.getByText('Test Task'));

  const taskItem = screen.getByText('Test Task').closest('li');
  const editButton = within(taskItem).getByRole('button', { name: /edit/i });
  fireEvent.click(editButton);

  const titleInput = screen.getByLabelText(/task title/i);
  fireEvent.change(titleInput, { target: { value: 'Updated Task' } });

  const updateButton = screen.getByRole('button', { name: /update task/i });
  fireEvent.click(updateButton);

  await waitFor(() => screen.getByText(/task updated successfully/i));
  await waitFor(() => screen.getByText(/updated task/i));
});

test('can delete a task after confirmation', async () => {
  renderWithTheme(<App />);
  await waitFor(() => screen.getByText('Test Task'));

  const taskItem = screen.getByText('Test Task').closest('li');
  const deleteButton = within(taskItem).getByRole('button', { name: /delete/i });
  fireEvent.click(deleteButton);

  expect(screen.getByText(/confirm delete/i)).toBeInTheDocument();

  const confirmDelete = screen.getByRole('button', { name: /delete/i });
  fireEvent.click(confirmDelete);

  await waitFor(() => screen.getByText(/task deleted successfully/i));
  await waitFor(() => expect(screen.queryByText('Test Task')).not.toBeInTheDocument());
});
