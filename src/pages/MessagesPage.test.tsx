import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MessagesPage from '../pages/MessagesPage';

jest.mock('../store/authStore', () => ({
  useAuthStore: () => ({ user: { id: 'test-user' } })
}));

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({}),
    subscribe: jest.fn(),
    removeChannel: jest.fn(),
    channel: jest.fn().mockReturnValue({ on: jest.fn().mockReturnThis(), subscribe: jest.fn(), removeChannel: jest.fn() })
  }
}));

describe('MessagesPage', () => {
  it('renderiza sin errores', () => {
    render(<MessagesPage />);
    expect(screen.getByText(/Selecciona una conversación/i)).toBeInTheDocument();
  });
});
