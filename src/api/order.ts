// api/order.ts

import axios from "axios";
import { CheckoutRequest } from "../hooks/CheckoutContext";

export const placeOrder = async (payload: CheckoutRequest) => {
    const response = await axios.post(
        `https://be-book-rental.onrender.com/api/order/craete`,
        payload
    );

    return response.data;
};