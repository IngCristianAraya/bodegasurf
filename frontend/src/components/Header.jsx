// src/components/Header.jsx
import React, { useContext } from 'react';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Clock from './Clock';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Has cerrado sesión correctamente');
  };
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10 h-16 border-b border-gray-100">
      <div className="w-full h-full flex items-center">
        {/* Título */}
        <div className="w-64 h-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-amber-500">
          <h1 className="text-white font-bold text-2xl">BodegaApp</h1>
        </div>
        
        {/* Contenido del header */}
        <div className="flex-1 h-full flex items-center justify-end px-6">
          {/* Reloj */}
          <div className="hidden md:flex items-center h-full">
            <Clock />
          </div>
          
          {/* Notificaciones */}
          <div className="h-full flex items-center px-4 border-r border-gray-100">
            <button 
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 relative"
              aria-label="Notificaciones"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>
          <div className="h-full flex items-center px-4 border-r border-gray-100 group">
            <button 
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 relative"
              aria-label="Notificaciones"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </button>
            </div>
          </div>
          {/* Perfil */}
          <div className="h-full flex items-center pl-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                  <svg className="h-6 w-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <span className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white h-3 w-3 rounded-full"></span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{user?.name || 'Usuario'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Rol'}</p>
                </div>
                <div className="relative group">
                  <button 
                    type="button"
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-expanded="false"
                  >
                    <svg className="h-4 w-4 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
