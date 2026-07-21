import axios from "axios";
import { endpoints } from "./api";
import { CartData, CartResponse, RemoveCartItemPayload, ValidateCartResponse } from "../types/cart";

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