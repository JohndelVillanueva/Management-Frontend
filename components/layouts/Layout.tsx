import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <div className="min-h-screen">
      {!isLoginPage && <Header />}
      <main className={!isLoginPage ? "pt-16" : ""}>
        {children}
      </main>
    </div>
  );
};

export default Layout;