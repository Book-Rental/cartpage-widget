import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "../hooks/useCart";
import { fetchCart } from "../api/cart";

vi.mock("@tanstack/react-query", () => ({
    useQuery: vi.fn(),
}));

vi.mock("../api/cart", () => ({
    fetchCart: vi.fn(),
}));

describe("useCart", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as ReturnType<typeof useQuery>);
    });

    it("calls useQuery with the correct configuration", () => {
        renderHook(() => useCart());

        expect(useQuery).toHaveBeenCalledTimes(1);

        expect(useQuery).toHaveBeenCalledWith({
            queryKey: ["cart"],
            queryFn: fetchCart,
        });
    });

    it("returns the value from useQuery", () => {
        const mockResult = {
            data: {
                _id: "1",
                userId: "1",
                createdAt: "",
                updatedAt: "",
                items: [],
                summary: {
                    subtotal: 0,
                    securityDepositTotal: 0,
                    deliveryFee: 0,
                    tax: 0,
                    total: 0,
                    items: [],
                },
            },
            isLoading: false,
            isError: false,
        };

        vi.mocked(useQuery).mockReturnValue(
            mockResult as ReturnType<typeof useQuery>
        );

        const { result } = renderHook(() => useCart());

        expect(result.current).toEqual(mockResult);
    });
});