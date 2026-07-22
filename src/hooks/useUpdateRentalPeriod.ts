import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCartRentalPeriod } from "../api/cart";

export const useUpdateRentalPeriod = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateCartRentalPeriod,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });
};