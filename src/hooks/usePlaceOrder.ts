// hooks/usePlaceOrder.ts

import { useMutation } from "@tanstack/react-query";
import { placeOrder } from "../api/order";

export const usePlaceOrder = () => {
    return useMutation({
        mutationFn: placeOrder,
    });
};