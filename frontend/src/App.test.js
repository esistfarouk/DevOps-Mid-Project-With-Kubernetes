import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

test('renders tasks from API', async () => {
  renderWithTheme(<App />);
  expect(screen.getByText(/task manager/i)).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText(/test task/i)).toBeInTheDocument());
});

test('can add a new task', async () => {
  renderWithTheme(<App />);
  
  fireEvent.change(screen.getByLabelText(/task title/i), {
    target: { value: 'New Task' },
  });
  fireEvent.change(screen.getByLabelText(/description/i), {
    target: { value: 'Some details' },
  });

  fireEvent.click(screen.getByText(/add task/i));
  await waitFor(() => expect(screen.getByText(/task created successfully/i)).toBeInTheDocument());
});
