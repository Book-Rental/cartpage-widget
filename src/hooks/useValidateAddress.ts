import { useMutation } from "@tanstack/react-query";
import { validateAddress } from "../api/address";

export const useValidateAddress = () => {
    return useMutation({
        mutationFn: validateAddress,
    });
};