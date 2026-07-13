import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useClearCart } from "../hooks/useClearCart";
import { clearCart } from "../api/cart";

vi.mock("@tanstack/react-query", () => ({
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
}));

vi.mock("../api/cart", () => ({
    clearCart: vi.fn(),
}));

describe("useClearCart", () => {
    const invalidateQueriesMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useQueryClient).mockReturnValue({
            invalidateQueries: invalidateQueriesMock,
        } as never);

        vi.mocked(useMutation).mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
        } as never);
    });

    it("uses clearCart as the mutation function", () => {
        renderHook(() => useClearCart());

        expect(useMutation).toHaveBeenCalledTimes(1);

        const options = vi.mocked(useMutation).mock.calls[0][0];

        expect(options.mutationFn).toBe(clearCart);
    });

    it("invalidates the cart query on success", () => {
        renderHook(() => useClearCart());

        const options = vi.mocked(useMutation).mock.calls[0][0];

        options.onSuccess?.(
            undefined,
            undefined,
            undefined,
            {} as never
        );

        expect(invalidateQueriesMock).toHaveBeenCalledWith({
            queryKey: ["cart"],
        });
    });
});