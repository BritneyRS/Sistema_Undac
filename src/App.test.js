import { render, screen } from '@testing-library/react';
import App from './App';

test('renderiza la pagina de inicio', () => {
  render(<App />);

  const texto = screen.getByText(/bienvenidos/i);
  const texto2 = screen.getByText(/gestión de convenios/i);

  expect(texto).toBeInTheDocument();
  expect(texto2).toBeInTheDocument();
});