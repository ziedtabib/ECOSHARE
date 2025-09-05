import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ECOSHARE app', () => {
  render(<App />);
  const linkElement = screen.getByText(/ECOSHARE/i);
  expect(linkElement).toBeInTheDocument();
});
