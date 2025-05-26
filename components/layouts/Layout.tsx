import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideHeader = ['/', '/login', '/signup'].includes(location.pathname);

  return (
    <div className="min-h-screen">
      {!hideHeader && <Header />}
      <main className={!hideHeader ? "pt-16" : ""}>
        {children}
      </main>
    </div>
  );
};

export default Layout;