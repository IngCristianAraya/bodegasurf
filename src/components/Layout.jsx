// src/components/Layout.jsx
import Sidebar from './Sidebar';
import Header from './Header';
import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header con logo */}
      <Header />
      
      <div className="flex flex-1 pt-20">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto ml-64">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
