export const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        ...options.headers
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken && !endpoint.includes('/auth/')) {
            try {
                const refreshResponse = await fetch(`${API_URL}/auth/refresh.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: refreshToken })
                });

                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    localStorage.setItem('token', data.access_token);
                    localStorage.setItem('refreshToken', data.refresh_token);

                    headers['Authorization'] = `Bearer ${data.access_token}`;

                    response = await fetch(`${API_URL}${endpoint}`, {
                        ...options,
                        headers
                    });
                }
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return response;
            }
        }

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    }

    return response;
}