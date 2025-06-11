import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';
import { useNotifications } from './hooks/useNotifications';

function App() {
  useNotifications(); // Centraliza la gestión de notificaciones

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-center" closeButton richColors />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;