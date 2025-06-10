import React from 'react';
import { render, screen } from '@testing-library/react';
jest.mock('../lib/supabase');
import HomePage from './HomePage';

describe('HomePage', () => {
  it('renderiza el feed principal', () => {
    render(<HomePage />);
    // Verifica que se muestre el contenido de un post simulado
    expect(screen.getByText(/post de prueba/i)).toBeInTheDocument();
  });
});
