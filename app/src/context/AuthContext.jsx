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

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Error al iniciar sesión');
        }

        const authData = data.data;
        localStorage.setItem('token', authData.access_token);
        localStorage.setItem('refreshToken', authData.refresh_token);
        localStorage.setItem('user', JSON.stringify(authData.user));

        setToken(authData.access_token);
        setRefreshToken(authData.refresh_token);
        setUser(authData.user);

        return authData;
    };

    const register = async (nombre, email, password) => {
        const response = await fetch(`${API_URL}/auth/register.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Error al registrar');
        }

        const authData = data.data;
        localStorage.setItem('token', authData.access_token);
        localStorage.setItem('refreshToken', authData.refresh_token);
        localStorage.setItem('user', JSON.stringify(authData.user));

        setToken(authData.access_token);
        setRefreshToken(authData.refresh_token);
        setUser(authData.user);

        return authData;
    };

    const refreshAccessToken = async () => {
        try {
            const response = await fetch(`${API_URL}/auth/refresh.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                logout();
                return null;
            }

            const authData = data.data;
            localStorage.setItem('token', authData.access_token);
            localStorage.setItem('refreshToken', authData.refresh_token);

            setToken(authData.access_token);
            setRefreshToken(authData.refresh_token);

            return authData.access_token;
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
