// api/order.ts

import axios from "axios";
import { CheckoutRequest } from "../types/checkout";

export const placeOrder = async (payload: CheckoutRequest) => {
    const response = await axios.post(
        `https://be-book-rental.onrender.com/api/order/craete`,
        payload,
        {
            withCredentials: true,
        }
    );

    return response.data;
};