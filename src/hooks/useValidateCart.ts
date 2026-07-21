import { useMutation } from "@tanstack/react-query";
import { validateCart } from "../api/cart";

export const useValidateCart = () => {
    return useMutation({
        mutationFn: validateCart,
    });
};