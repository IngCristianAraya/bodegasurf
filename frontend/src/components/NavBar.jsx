import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, User, LogOut, Settings } from 'lucide-react';

const NavBar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <div className="bg-white border-b shadow-sm flex justify-between items-center p-4">
            {/* Botón de menú móvil */}
            <button className="lg:hidden p-2" onClick={() => document.body.classList.toggle('sidebar-open')}>
                <Menu size={20} />
            </button>

            {/* Título de la página (puedes hacerlo dinámico) */}
            <h1 className="text-lg font-medium text-gray-800 hidden sm:block">Sistema de Ventas</h1>

            {/* Controles de usuario */}
            <div className="flex items-center space-x-4">
                {/* Notificaciones */}
                <button className="p-2 rounded-full hover:bg-gray-100">
                    <Bell size={18} />
                </button>

                {/* Perfil de usuario */}
                <div className="relative">
                    <button
                        className="flex items-center space-x-2"
                        onClick={toggleMenu}
                    >
                        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="hidden md:inline text-sm font-medium">{user?.name || 'Usuario'}</span>
                    </button>

                    {/* Menú desplegable */}
                    {menuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-md shadow-md z-50">
                            <div className="py-2">
                                <button
                                    className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left"
                                    onClick={() => navigate('/profile')}
                                >
                                    <User size={16} className="mr-2" />
                                    <span>Perfil</span>
                                </button>
                                <button
                                    className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left"
                                    onClick={() => navigate('/settings')}
                                >
                                    <Settings size={16} className="mr-2" />
                                    <span>Configuración</span>
                                </button>
                                <hr className="my-1" />
                                <button
                                    className="flex items-center px-4 py-2 hover:bg-gray-100 w-full text-left text-red-600"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={16} className="mr-2" />
                                    <span>Cerrar sesión</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NavBar; 