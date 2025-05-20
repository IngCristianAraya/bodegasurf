// src/components/Header.jsx
import React from 'react';
import { User } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <h1 className="text-xl font-bold text-gray-900">BodegaApp</h1>
          
          {/* Botón de Login */}
          <button 
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <User className="h-4 w-4 mr-2" />
            Iniciar sesión
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
