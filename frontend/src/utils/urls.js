export const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "") || `${window.location.origin}/api`;

export const AUTH_URLS = {
    LOGIN: `auth/login`,
    REGISTER: `auth/signup`,
    LOGOUT: `auth/logout`,
    GOOGLE_LOGIN: `auth/google-login`,
    FORGOT_PASSWORD: `auth/forgot-password`,
};

export const DONATION_URLS = {
    POST: `donations/`,
    GET_ALL: `donations/feed`,
    GET_MY_POSTS: `donations/my-posts`,
    GET_VOLUNTEER_HISTORY: `donations/volunteer-history`,
    GET_BY_ID: (id) => `donations/${id}`,
    GET_ASSIGNED: `donations/assigned`,
    FULFILL: (id) => `donations/fulfill/${id}`,
};

export const USER_URLS = {
    PROFILE: `${BASE_URL}/user/profile`,
    UPDATE: `${BASE_URL}/user/update`,
    SET_ROLE: `${BASE_URL}/user/role`,
};

export const ADMIN_URLS = {
    TRACKER: `${BASE_URL}/admin/tracker`,
    STATS: `${BASE_URL}/admin/stats`,
};
