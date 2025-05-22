import { createContext, useState, useEffect, useContext } from 'react';
import api from '../config/axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si el usuario está autenticado al cargar la aplicación
  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  // Verificar si el usuario está autenticado
  const checkUserLoggedIn = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Verificar token con el backend
      const response = await api.get('/auth/me');
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        
        // Si el usuario tiene un tenant asociado, lo establecemos
        if (response.data.user.tenant) {
          setTenant({
            id: response.data.user.tenant._id || response.data.user.tenant,
            name: response.data.user.tenant.name || 'Mi Tienda'
          });
        }
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      if (error.response && error.response.status === 401) {
        // Token inválido o expirado
        localStorage.removeItem('token');
        setUser(null);
        setTenant(null);
      }
      setError('Error al verificar la sesión. Por favor, inicia sesión nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Iniciar sesión
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        setUser(user);
        
        // Establecer el tenant si está disponible
        if (user.tenant) {
          setTenant({
            id: user.tenant._id || user.tenant,
            name: user.tenant.name || 'Mi Tienda'
          });
        }
        
        setError(null);
        return user;
      }
      
      throw new Error('No se recibió un token de autenticación');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setTenant(null);
    setError(null);
  };

  // Valor del contexto
  const value = {
    user,
    tenant,
    loading,
    error,
    login,
    logout,
    setTenant,
    checkUserLoggedIn
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
