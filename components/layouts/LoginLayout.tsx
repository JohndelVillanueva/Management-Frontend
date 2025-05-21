import React from 'react';

const LoginLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <main>{children}</main>
    </div>
  );
};

export default LoginLayout;