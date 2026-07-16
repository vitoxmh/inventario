import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#1a1a2e',
                color: '#f1f5f9'
            }}>
                <div>Cargando...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin()) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#1a1a2e',
                color: '#f1f5f9',
                gap: '1rem'
            }}>
                <i className="bi bi-shield-lock" style={{ fontSize: '3rem', color: '#ef4444' }}></i>
                <h2>Acceso Denegado</h2>
                <p>No tienes permisos de administrador</p>
            </div>
        );
    }

    return children;
}
