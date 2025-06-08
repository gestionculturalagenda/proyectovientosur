import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import LeftSidebar from './LeftSidebar';
import MainContent from './MainContent';
import RightSidebar from './RightSidebar';
import MobileHeader from './MobileHeader';
import ConversationModal from './ConversationModal';

const MainLayout: React.FC = () => {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [showConversations, setShowConversations] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header móvil */}
      <MobileHeader
        onOpenLeft={() => setLeftOpen((v) => !v)}
        onOpenRight={() => setRightOpen((v) => !v)}
      />
      <div className="flex flex-1 gap-6 max-w-screen-2xl mx-auto w-full">
        {/* Sidebar izquierdo */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 transform ${leftOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 w-80 bg-white shadow-lg lg:shadow-none lg:w-1/4 hidden md:block lg:block`}
        >
          <LeftSidebar onOpenConversations={() => setShowConversations(true)} />
        </aside>
        {/* Contenido principal */}
        <main className="flex-1 mx-auto max-w-3xl p-4 w-full md:w-full bg-white rounded-lg shadow-md lg:w-2/4">
          <MainContent />
          <div className="container mx-auto px-4 py-2 max-w-2xl">
            <Outlet />
          </div>
        </main>
        {/* Sidebar derecho */}
        <aside
          className={`fixed lg:static inset-y-0 right-0 z-30 transform ${rightOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 transition-transform duration-200 w-80 bg-white shadow-lg lg:shadow-none lg:w-1/4 hidden md:block lg:block`}
        >
          <RightSidebar />
          <ConversationModal open={showConversations} onClose={() => setShowConversations(false)} />
        </aside>
      </div>
      <BottomNavigation />
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