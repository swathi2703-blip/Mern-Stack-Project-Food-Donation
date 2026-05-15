export const BASE_URL = 'http://localhost:3000/api';

export const AUTH_URLS = {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/signup`,
    LOGOUT: `${BASE_URL}/auth/logout`,
};

export const DONATION_URLS = {
    POST: `${BASE_URL}/donations/post`,
    GET_ALL: `${BASE_URL}/donations/all`,
    GET_BY_ID: (id) => `${BASE_URL}/donations/${id}`,
};

export const USER_URLS = {
    PROFILE: `${BASE_URL}/user/profile`,
    UPDATE: `${BASE_URL}/user/update`,
};
