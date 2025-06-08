import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useAuthStore } from './store/authStore';
import ProfilePageWithId from './pages/ProfilePageWithId';

// Lazy loaded components
const HomePage = lazy(() => import('./pages/HomePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const CreatePage = lazy(() => import('./pages/CreatePage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// New pages
const BlogsPage = lazy(() => import('./pages/BlogsPage'));
const StoriesPage = lazy(() => import('./pages/StoriesPage'));
const StreamsPage = lazy(() => import('./pages/StreamsPage'));
const NewBlogPage = lazy(() => import('./pages/NewBlogPage'));
const UserSearch = lazy(() => import('./components/profile/UserSearch').then(m => ({ default: m.UserSearch })));
const DirectMessagesPage = lazy(() => import('./pages/DirectMessagesPage'));
const AgendaPage = lazy(() => import('./pages/AgendaPage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const CulturalEventDetailPage = lazy(() => import('./pages/CulturalEventDetailPage'));
const CumpleanosDetailPage = lazy(() => import('./pages/CumpleanosDetailPage'));

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Verificando sesión..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<HomePage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="create" element={<CreatePage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="/profile/:username" element={<ProfilePageWithId />} />
          <Route path="/profile/id/:userId" element={<ProfilePageWithId />} />
          <Route path="blogs" element={<BlogsPage />} />
          <Route path="blogs/new" element={<NewBlogPage />} />
          <Route path="stories" element={<StoriesPage />} />
          <Route path="streams" element={<StreamsPage />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="/buscar-usuarios" element={<Suspense fallback={<LoadingSpinner />}><div style={{padding: 24}}><UserSearch /></div></Suspense>} />
          <Route path="/direct-messages" element={<DirectMessagesPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="blogs/:id" element={<BlogDetailPage />} />
          <Route path="eventos/:id" element={<CulturalEventDetailPage />} />
          <Route path="cumpleanos/:id" element={<CumpleanosDetailPage />} />
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;