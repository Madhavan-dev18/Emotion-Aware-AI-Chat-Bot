import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── CSRF cookie helper ──────────────────────────────────────────────────
// Flask-JWT-Extended sets the CSRF token as a JS-readable (non-HTTPOnly)
// cookie alongside the HTTPOnly JWT cookie. Axios's built-in xsrfCookieName
// option only auto-attaches this header for same-origin requests; since the
// frontend (Vercel) and backend (Render) are on different origins, we read
// the cookie manually and attach it ourselves.
function getCookie(name) {
    const match = document.cookie.match(
        new RegExp('(^| )' + name + '=([^;]+)')
    );
    return match ? decodeURIComponent(match[2]) : null;
}

api.interceptors.request.use((config) => {
    const method = (config.method || 'get').toLowerCase();

    if (['post', 'put', 'patch', 'delete'].includes(method)) {
        // The refresh endpoint is protected by the refresh token + its own
        // CSRF cookie, not the access token's CSRF cookie.
        const isRefreshCall = config.url && config.url.includes('/auth/refresh');
        const cookieName = isRefreshCall ? 'csrf_refresh_token' : 'csrf_access_token';

        const csrfToken = getCookie(cookieName);
        if (csrfToken) {
            config.headers['X-CSRF-TOKEN'] = csrfToken;
        }
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('auth_change'));
        }
        return Promise.reject(error);
    }
);

export default api;