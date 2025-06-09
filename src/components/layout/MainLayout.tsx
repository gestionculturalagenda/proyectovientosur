import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import LeftSidebar from './LeftSidebar';
import MainContent from './MainContent';
import RightSidebar from './RightSidebar';
import Header from './Header';
import ConversationModal from './ConversationModal';

const MainLayout: React.FC = () => {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [showConversations, setShowConversations] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header general visible en móvil y escritorio */}
      <Header onOpenConversations={() => setShowConversations(true)} />
      <div className="flex flex-1 gap-0 sm:gap-2 md:gap-4 max-w-full mx-auto w-full overflow-x-hidden">
        {/* Sidebar izquierdo */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 transform ${leftOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 w-64 sm:w-72 md:w-80 bg-white dark:bg-gray-800 shadow-lg lg:shadow-none lg:w-1/4 hidden md:block lg:block`}
        >
          <LeftSidebar onOpenConversations={() => setShowConversations(true)} />
        </aside>
        {/* Contenido principal */}
        <main className="flex-1 mx-auto max-w-full sm:max-w-2xl md:max-w-3xl p-2 sm:p-4 w-full bg-white dark:bg-gray-900 rounded-none sm:rounded-lg shadow-none sm:shadow-md lg:w-2/4 border-0 sm:border border-gray-100 dark:border-gray-800 min-h-[calc(100vh-56px)] overflow-y-auto">
          <MainContent />
          <div className="container mx-auto px-0 sm:px-4 py-2 max-w-full sm:max-w-2xl">
            <Outlet />
          </div>
        </main>
        {/* Sidebar derecho */}
        <aside
          className={`fixed lg:static inset-y-0 right-0 z-30 transform ${rightOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 transition-transform duration-200 w-64 sm:w-72 md:w-80 bg-white dark:bg-gray-800 shadow-lg lg:shadow-none lg:w-1/4 hidden md:block lg:block`}
        >
          <RightSidebar />
          <ConversationModal open={showConversations} onClose={() => setShowConversations(false)} />
        </aside>
      </div>
      {/* Panel de navegación inferior solo en móvil */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40 flex justify-between items-center px-0 py-1 max-w-full shadow-t">
        <BottomNavigation />
      </nav>
      {/* Backdrop para móvil */}
      {(leftOpen || rightOpen) && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => {
            setLeftOpen(false);
            setRightOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default MainLayout;