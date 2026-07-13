import { useQuery } from "@tanstack/react-query";
import { fetchCart } from "../api/cart";
import { CartData } from "../types/cart";

export const useCart = () => {
    return useQuery<CartData>({
        queryKey: ["cart"],
        queryFn: fetchCart,
    });
};