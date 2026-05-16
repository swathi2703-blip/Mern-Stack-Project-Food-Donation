import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api`;

const http = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
http.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
http.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Unauthenticated - could handle redirect or logout here
            console.error('Session expired or unauthorized');
        }
        return Promise.reject(error);
    }
);

export default http;
