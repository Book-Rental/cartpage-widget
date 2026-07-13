import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeCartItem } from "../api/cart";
export const useDeleteCartItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeCartItem,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["cart"],
            });
        },
    });
};