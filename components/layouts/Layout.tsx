import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header';
import Sidebar from '../Sidebar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Pages that should not show header or sidebar
  const hideHeaderAndSidebar = ['/', '/login', '/signup', '/verify-email'];
  const shouldHideHeaderAndSidebar = hideHeaderAndSidebar.includes(location.pathname);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!shouldHideHeaderAndSidebar && (
        <>
          <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
          <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
            <Header />
          </div>
        </>
      )}
      <main className={`transition-all duration-300 ${
        shouldHideHeaderAndSidebar 
          ? "" 
          : `${sidebarOpen ? 'ml-64' : 'ml-16'} pt-8`
      }`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;