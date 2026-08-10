// api/order.ts

import axios from "axios";
import { CheckoutRequest } from "../types/checkout";
import { endpoints } from "./api";

export const placeOrder = async (payload: CheckoutRequest) => {
    const response = await axios.post(
        endpoints.placeOrder,
        payload,
        {
            withCredentials: true,
        }
    );

    return response.data;
};