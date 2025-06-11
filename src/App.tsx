import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { useNotificationStore } from './store/notificationStore';
import { useAuthStore } from './store/authStore';

function App() {
  const user = useAuthStore(state => state.user);
  useEffect(() => {
    if (user?.id) {
      useNotificationStore.getState().subscribeToNotifications();
    }
  }, [user?.id]);

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