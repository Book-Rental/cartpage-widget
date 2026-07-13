import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDeleteCartItem } from "../hooks/useDeleteCartItem";
import { removeCartItem } from "../api/cart";

vi.mock("@tanstack/react-query", () => ({
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
}));

vi.mock("../api/cart", () => ({
    removeCartItem: vi.fn(),
}));

describe("useDeleteCartItem", () => {
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

    it("uses removeCartItem as the mutation function", () => {
        renderHook(() => useDeleteCartItem());

        expect(useMutation).toHaveBeenCalledTimes(1);

        const options = vi.mocked(useMutation).mock.calls[0][0];

        expect(options.mutationFn).toBe(removeCartItem);
    });

    it("invalidates the cart query on success", () => {
        renderHook(() => useDeleteCartItem());

        const options = vi.mocked(useMutation).mock.calls[0][0] as {
            mutationFn: typeof removeCartItem;
            onSuccess?: (...args: unknown[]) => void;
        };

        options.onSuccess?.(
            undefined,
            undefined,
            undefined,
            undefined
        );

        expect(invalidateQueriesMock).toHaveBeenCalledWith({
            queryKey: ["cart"],
        });
    });
});