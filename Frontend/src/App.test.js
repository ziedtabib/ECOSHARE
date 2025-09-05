import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock des modules qui pourraient causer des problèmes
jest.mock('./services/api', () => ({
  getAuthToken: () => null,
}));

jest.mock('./services/socketService', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
}));

test('renders ECOSHARE app', () => {
  render(<App />);
  // Vérifier qu'un élément avec "ECOSHARE" est présent
  const linkElement = screen.getByText(/ECOSHARE/i);
  expect(linkElement).toBeInTheDocument();
});
