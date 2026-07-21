import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCartQuantity } from "../api/cart";

export const useUpdateCartQuantity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateCartQuantity,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["cart"],
            });
        },
    });
};