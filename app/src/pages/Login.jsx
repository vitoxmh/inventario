import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.scss';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <i className="bi bi-controller"></i>
                    <h1>Inventario</h1>
                    <p>Inicia sesión para continuar</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="login-error">
                            <i className="bi bi-exclamation-circle"></i>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Iniciando sesión...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-box-arrow-in-right"></i>
                                Iniciar Sesión
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
