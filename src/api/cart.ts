import axios from "axios";
import { endpoints } from "./api";
import { CartData, CartResponse, RemoveCartItemPayload, UpdateCartQuantityPayload, UpdateRentalPeriodPayload, ValidateCartResponse } from "../types/cart";

/**
 * Retrieves or generates a persistent anonymous ID for guest users.
 * The ID is stored in localStorage and survives page refreshes.
 */
const getAnonymousId = (): string => {
    const STORAGE_KEY = "book_rental_anonymous_id";
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
};

// Set the X-Anonymous-Id header on all outgoing requests
axios.defaults.headers.common["X-Anonymous-Id"] = getAnonymousId();

export const fetchCart = async (): Promise<CartData> => {

    const response = await axios.get<CartResponse>(endpoints.cart, {

        withCredentials: true,
    });

    return response.data.data;
};


export const validateCart = async () => {
    const { data } = await axios.post<ValidateCartResponse>(
        `${endpoints.cart}/validate`,
        {},
        {
            withCredentials: true,
        }
    );

    return data.data;
};

export const removeCartItem = async ({
    bookId,
    pricingMode,
    rentalPeriod,
}: RemoveCartItemPayload) => {
    const { data } = await axios.delete(
        `${endpoints.cart}/items/${bookId}`,
        {
            withCredentials: true,
            data: {
                pricingMode,
                rentalPeriod,
            },
        }
    );

    return data;
};

export const clearCart = async () => {
    const { data } = await axios.delete(
        `${endpoints.cart}/clear`,
        {
            withCredentials: true,
        }
    );

    return data;
};

export const updateCartQuantity = async ({
    bookId,
    quantity,
    pricingMode,
    rentalPeriod,
}: UpdateCartQuantityPayload) => {
    const { data } = await axios.patch(
        `${endpoints.cart}/items/${bookId}`,
        {
            quantity,
            pricingMode,
            rentalPeriod,
        },
        {
            withCredentials: true,
        }
    );

    return data;
};

export const updateCartRentalPeriod = async ({
    bookId,
    pricingMode,
    currentRentalPeriod,
    newRentalPeriod,
}: UpdateRentalPeriodPayload) => {
    const { data } = await axios.patch(
        `${endpoints.cart}/items/${bookId}/rental-period`,
        {
            pricingMode,
            currentRentalPeriod,
            newRentalPeriod,
        },
        {
            withCredentials: true,
        }
    );

    return data;
};
