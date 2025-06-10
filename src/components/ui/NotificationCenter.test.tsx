import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationCenter, { Notification } from './NotificationCenter';

describe('NotificationCenter', () => {
  it('muestra notificaciones', () => {
    const notifications: Notification[] = [
      { id: '1', type: 'comment', title: 'Test', description: 'Notificación de prueba', createdAt: new Date().toISOString(), read: false }
    ];
    render(<NotificationCenter notifications={notifications} />);
    // Abrir el panel de notificaciones
    fireEvent.click(screen.getByRole('button', { name: /notificaciones/i }));
    expect(screen.getByText('Notificación de prueba')).toBeInTheDocument();
  });
});
