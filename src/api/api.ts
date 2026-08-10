export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const endpoints = {
    cart: `${API_BASE_URL}/cart`,
    validateAddress: `${API_BASE_URL}/user/validateAddress`,
    placeOrder: `${API_BASE_URL}/order/create`,

};