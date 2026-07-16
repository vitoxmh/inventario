import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al iniciar sesión');
        }

        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setUser(data.user);

        return data;
    };

    const register = async (nombre, email, password) => {
        const response = await fetch(`${API_URL}/auth/register.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al registrar');
        }

        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setUser(data.user);

        return data;
    };

    const refreshAccessToken = async () => {
        try {
            const response = await fetch(`${API_URL}/auth/refresh.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            const data = await response.json();

            if (!response.ok) {
                logout();
                return null;
            }

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);

            setToken(data.access_token);
            setRefreshToken(data.refresh_token);

            return data.access_token;
        } catch {
            logout();
            return null;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        setToken(null);
        setRefreshToken(null);
        setUser(null);
    };

    const isAdmin = () => {
        return user && user.rol === 'admin';
    };

    const getAuthHeaders = () => {
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            register,
            logout,
            refreshAccessToken,
            isAdmin,
            getAuthHeaders,
            isAuthenticated: !!token
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
}
