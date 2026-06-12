import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, 
    // FLASK-JWT-EXTENDED CSRF INTEGRATION:
    xsrfCookieName: 'csrf_access_token',
    xsrfHeaderName: 'X-CSRF-TOKEN',
    headers: {
        'Content-Type': 'application/json',
    },
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