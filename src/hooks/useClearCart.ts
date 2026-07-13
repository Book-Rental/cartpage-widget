import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearCart } from "../api/cart";

export const useClearCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: clearCart,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["cart"],
            });
        },
    });
};