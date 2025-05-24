import { useState, useEffect, useContext, createContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is already logged in on mount
        const checkAuth = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');

                if (token) {
                    const response = await api.get('/auth/me');
                    setUser(response.data);
                }
            } catch (err) {
                console.error('Authentication check failed:', err);
                // Clear invalid token
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Login function
    const login = async (credentials) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await api.post('/auth/login', credentials);
            const { token, user } = response.data;

            // Store token in localStorage
            localStorage.setItem('token', token);

            // Set user in state
            setUser(user);
            return user;
        } catch (err) {
            setError(err.response?.data?.message || 'Error de autenticación');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    // Register function
    const register = async (userData) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrar usuario');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                error,
                login,
                logout,
                register
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default useAuth; 