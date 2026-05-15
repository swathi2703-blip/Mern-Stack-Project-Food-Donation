/**
 * Utility functions for the Food Donation project
 */

// Format date to local string
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// Capitalize first letter of a string
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Validate email format
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Save user to local storage
export const saveToStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// Get user from local storage
export const getFromStorage = (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
};

// Remove from local storage
export const removeFromStorage = (key) => {
    localStorage.removeItem(key);
};
