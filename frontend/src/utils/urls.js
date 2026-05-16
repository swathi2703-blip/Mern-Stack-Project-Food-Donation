export const BASE_URL = import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api`;

export const AUTH_URLS = {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/signup`,
    LOGOUT: `${BASE_URL}/auth/logout`,
};

export const DONATION_URLS = {
    POST: `${BASE_URL}/donations/`,
    GET_ALL: `${BASE_URL}/donations/feed`,
    GET_MY_POSTS: `${BASE_URL}/donations/my-posts`,
    GET_VOLUNTEER_HISTORY: `${BASE_URL}/donations/volunteer-history`,
    GET_BY_ID: (id) => `${BASE_URL}/donations/${id}`,
    GET_ASSIGNED: `${BASE_URL}/donations/assigned`,
    FULFILL: (id) => `${BASE_URL}/donations/fulfill/${id}`,
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
