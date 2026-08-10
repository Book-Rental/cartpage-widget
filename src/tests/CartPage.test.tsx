import type { ReactNode } from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

import CartPage from "../pages/CartPage";
import { useCart } from "../hooks/useCart";
import { CartData, CartItemType, InvalidCartItem } from "../types/cart";
import { showToast } from "../utils/ToastFunction";

interface MockModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

interface MockModalHeaderProps {
    onClose: () => void;
    children: ReactNode;
}

interface MutateOptions<T> {
    onSuccess: (result: T) => void;
    onError: () => void;
}

const clearCartMock = vi.fn();
const validateCartMock = vi.fn();

vi.mock("../hooks/useCart", () => ({
    useCart: vi.fn(),
}));

vi.mock("../hooks/useClearCart", () => ({
    useClearCart: () => ({
        mutate: clearCartMock,
        isPending: false,
    }),
}));

vi.mock("../hooks/useValidateCart", () => ({
    useValidateCart: () => ({
        mutate: validateCartMock,
    }),
}));

vi.mock("../utils/ToastFunction", () => ({
    showToast: vi.fn(),
}));

vi.mock("../components/CartItem", () => ({
    default: ({
        item,
        errorMessage,
        onValidationSuccess,
    }: {
        item: CartItemType;
        errorMessage?: string;
        onValidationSuccess: () => void;
    }) => (
        <div>
            <div>{item.bookId.name}</div>
            <div>{item.bookId.author}</div>

            {errorMessage && <div>{errorMessage}</div>}

            <button onClick={onValidationSuccess}>
                Clear Error {item.bookId.name}
            </button>
        </div>
    ),
}));

vi.mock("../components/OrderSummary", () => ({
    default: ({ onCheckout }: { onCheckout: () => void }) => (
        <div>
            <div>Order Summary Component</div>

            <button onClick={onCheckout}>Checkout</button>
        </div>
    ),
}));

vi.mock("@rentbook/rentbook-ui-lib", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("@rentbook/rentbook-ui-lib")>();

    return {
        ...actual,

        Modal: ({
            isOpen,
            onClose,
            children,
        }: MockModalProps) =>
            isOpen ? (
                <div data-testid="modal">
                    <button
                        data-testid="modal-backdrop-close"
                        onClick={onClose}
                    >
                        Backdrop Close
                    </button>

                    {children}
                </div>
            ) : null,

        ModalHeader: ({
            onClose,
            children,
        }: MockModalHeaderProps) => (
            <div>
                <span>{children}</span>

                <button
                    data-testid="modal-header-close"
                    onClick={onClose}
                >
                    ×
                </button>
            </div>
        ),
    };
});

const mockUseCart = useCart as Mock;

const cartData: CartData = {
    _id: "cart-1",
    userId: "user-1",
    createdAt: "",
    updatedAt: "",

    items: [
        {
            bookId: {
                _id: "1",
                name: "Atomic Habits",
                author: "James Clear",
                description: "",
                coverImage: "",
                purchasePrice: 500,
                rentalPricePerDay: 20,
                rentalPricePerWeek: 100,
                rentalPricePerMonth: 300,
                securityDeposit: 1000,
            },
            quantity: 1,
            pricingMode: "rent",
            rentalPeriod: "day",
            addedAt: "",
        },
    ],

    summary: {
        subtotal: 20,
        securityDepositTotal: 1000,
        deliveryFee: 50,
        tax: 10,
        total: 1080,

        items: [
            {
                bookId: "1",
                quantity: 1,
                pricingMode: "rent",
                rentalPeriod: "day",
                unitPrice: 20,
                lineSubtotal: 20,
                securityDepositLine: 1000,
            },
        ],
    },
};

describe("CartPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows loading spinner", () => {
        mockUseCart.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        });

        render(<CartPage />);

        expect(
            screen.getByText(/Loading cart details/i)
        ).toBeInTheDocument();
    });

    it("shows error message when cart fails to load", () => {
        mockUseCart.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        });

        render(<CartPage />);

        expect(
            screen.getByText(/Failed to load cart/i)
        ).toBeInTheDocument();
    });

    it("shows error message when cart data is unavailable", () => {
        mockUseCart.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        expect(
            screen.getByText(/Failed to load cart/i)
        ).toBeInTheDocument();
    });

    it("renders cart data", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        expect(
            screen.getByText("Atomic Habits")
        ).toBeInTheDocument();

        expect(
            screen.getByText("James Clear")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Order Summary Component")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: /Clear Cart/i,
            })
        ).toBeInTheDocument();
    });

    it("dispatches loading status when cart is loading", () => {
        const dispatchSpy = vi.spyOn(window, "dispatchEvent");

        mockUseCart.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        });

        render(<CartPage />);

        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "widget-loading-status",
                detail: true,
            })
        );
    });

    it("dispatches loading status when cart finishes loading", () => {
        const dispatchSpy = vi.spyOn(window, "dispatchEvent");

        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "widget-loading-status",
                detail: false,
            })
        );
    });

    it("shows empty cart and Browse Books button", () => {
        mockUseCart.mockReturnValue({
            data: {
                ...cartData,
                items: [],
            },
            isLoading: false,
            isError: false,
        });

        const pushSpy = vi.spyOn(window.history, "pushState");
        const dispatchSpy = vi.spyOn(window, "dispatchEvent");

        render(<CartPage />);

        expect(
            screen.getByText(/Your cart is empty/i)
        ).toBeInTheDocument();

        const browseButton = screen.getByRole("button", {
            name: /Browse Books/i,
        });

        expect(browseButton).toBeInTheDocument();

        fireEvent.click(browseButton);

        expect(pushSpy).toHaveBeenCalledWith(
            {},
            "",
            "/books"
        );

        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.any(PopStateEvent)
        );
    });

    it("does not render Clear Cart button when cart is empty", () => {
        mockUseCart.mockReturnValue({
            data: {
                ...cartData,
                items: [],
            },
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        expect(
            screen.queryByRole("button", {
                name: /Clear Cart/i,
            })
        ).not.toBeInTheDocument();
    });

    it("opens and closes clear cart modal", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /Clear Cart/i,
            })
        );

        expect(
            screen.getByText(
                /Are you sure you want to remove all books/i
            )
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Cancel/i,
            })
        );

        expect(
            screen.queryByText(
                /Are you sure you want to remove all books/i
            )
        ).not.toBeInTheDocument();
    });

    it("closes clear cart modal using backdrop onClose", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /Clear Cart/i,
            })
        );

        expect(
            screen.getByText(
                /Are you sure you want to remove all books/i
            )
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByTestId("modal-backdrop-close")
        );

        expect(
            screen.queryByText(
                /Are you sure you want to remove all books/i
            )
        ).not.toBeInTheDocument();
    });

    it("closes clear cart modal using header onClose", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /Clear Cart/i,
            })
        );

        fireEvent.click(
            screen.getByTestId("modal-header-close")
        );

        expect(
            screen.queryByText(
                /Are you sure you want to remove all books/i
            )
        ).not.toBeInTheDocument();
    });

    it("calls clear cart mutation", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /Clear Cart/i,
            })
        );

        fireEvent.click(
            screen.getAllByRole("button", {
                name: /Clear Cart/i,
            })[1]
        );

        expect(clearCartMock).toHaveBeenCalledTimes(1);
        expect(clearCartMock).toHaveBeenCalledWith(
            undefined,
            expect.objectContaining({
                onSuccess: expect.any(Function),
                onError: expect.any(Function),
            })
        );
    });

    it("closes modal and shows success toast when clearing cart succeeds", async () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /Clear Cart/i,
            })
        );

        fireEvent.click(
            screen.getAllByRole("button", {
                name: /Clear Cart/i,
            })[1]
        );

        const { onSuccess } =
            clearCartMock.mock.calls[0][1] as MutateOptions<void>;

        act(() => {
            onSuccess(undefined);
        });

        await waitFor(() => {
            expect(
                screen.queryByText(
                    /Are you sure you want to remove all books/i
                )
            ).not.toBeInTheDocument();
        });

        expect(showToast).toHaveBeenCalledWith(
            "Cart cleared successfully"
        );
    });

    it("shows error toast when clearing cart fails", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /Clear Cart/i,
            })
        );

        fireEvent.click(
            screen.getAllByRole("button", {
                name: /Clear Cart/i,
            })[1]
        );

        const { onError } =
            clearCartMock.mock.calls[0][1] as MutateOptions<void>;

        onError();

        expect(showToast).toHaveBeenCalledWith(
            "Failed to clear cart",
            "error"
        );
    });

    it("validates cart when Checkout is clicked", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /Checkout/i,
            })
        );

        expect(validateCartMock).toHaveBeenCalledTimes(1);

        expect(validateCartMock).toHaveBeenCalledWith(
            undefined,
            expect.objectContaining({
                onSuccess: expect.any(Function),
                onError: expect.any(Function),
            })
        );
    });

    it("navigates to checkout when cart validation succeeds", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        const pushSpy = vi.spyOn(window.history, "pushState");
        const dispatchSpy = vi.spyOn(window, "dispatchEvent");

        render(<CartPage />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /Checkout/i,
            })
        );

        const { onSuccess } =
            validateCartMock.mock.calls[0][1] as MutateOptions<{
                isValid: boolean;
                invalidItems: InvalidCartItem[];
            }>;

        act(() => {
            onSuccess({
                isValid: true,
                invalidItems: [],
            });
        });

        expect(pushSpy).toHaveBeenCalledWith(
            {},
            "",
            "/checkout"
        );

        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.any(PopStateEvent)
        );
    });

    it("shows validation modal when cart validation fails", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        const pushSpy = vi.spyOn(window.history, "pushState");

        render(<CartPage />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /Checkout/i,
            })
        );

        const { onSuccess } =
            validateCartMock.mock.calls[0][1] as MutateOptions<{
                isValid: boolean;
                invalidItems: InvalidCartItem[];
            }>;

        act(() => {
            onSuccess({
                isValid: false,
                invalidItems: [
                    {
                        bookId: "1",
                        reason: "Out of stock",
                    },
                ],
            });
        });

        expect(
            screen.getByText(
                /Some items in your cart are unavailable/i
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText("Out of stock")
        ).toBeInTheDocument();

        expect(pushSpy).not.toHaveBeenCalledWith(
            {},
            "",
            "/checkout"
        );
    });

    it("passes validation error to the correct cart item", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /Checkout/i,
            })
        );

        const { onSuccess } =
            validateCartMock.mock.calls[0][1] as MutateOptions<{
                isValid: boolean;
                invalidItems: InvalidCartItem[];
            }>;

        act(() => {
            onSuccess({
                isValid: false,
                invalidItems: [
                    {
                        bookId: "1",
                        reason: "Insufficient inventory",
                    },
                ],
            });
        });

        expect(
            screen.getByText("Insufficient inventory")
        ).toBeInTheDocument();
    });

    it("closes validation modal using OK button", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /Checkout/i,
            })
        );

        const { onSuccess } =
            validateCartMock.mock.calls[0][1] as MutateOptions<{
                isValid: boolean;
                invalidItems: InvalidCartItem[];
            }>;

        act(() => {
            onSuccess({
                isValid: false,
                invalidItems: [
                    {
                        bookId: "1",
                        reason: "Out of stock",
                    },
                ],
            });
        });

        expect(
            screen.getByText(
                /Some items in your cart are unavailable/i
            )
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: /^OK$/i,
            })
        );

        expect(
            screen.queryByText(
                /Some items in your cart are unavailable/i
            )
        ).not.toBeInTheDocument();
    });

    it("closes validation modal using backdrop onClose", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /Checkout/i,
            })
        );

        const { onSuccess } =
            validateCartMock.mock.calls[0][1] as MutateOptions<{
                isValid: boolean;
                invalidItems: InvalidCartItem[];
            }>;

        act(() => {
            onSuccess({
                isValid: false,
                invalidItems: [
                    {
                        bookId: "1",
                        reason: "Out of stock",
                    },
                ],
            });
        });

        fireEvent.click(
            screen.getByTestId("modal-backdrop-close")
        );

        expect(
            screen.queryByText(
                /Some items in your cart are unavailable/i
            )
        ).not.toBeInTheDocument();
    });

    it("closes validation modal using header onClose", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /Checkout/i,
            })
        );

        const { onSuccess } =
            validateCartMock.mock.calls[0][1] as MutateOptions<{
                isValid: boolean;
                invalidItems: InvalidCartItem[];
            }>;

        act(() => {
            onSuccess({
                isValid: false,
                invalidItems: [
                    {
                        bookId: "1",
                        reason: "Out of stock",
                    },
                ],
            });
        });

        fireEvent.click(
            screen.getByTestId("modal-header-close")
        );

        expect(
            screen.queryByText(
                /Some items in your cart are unavailable/i
            )
        ).not.toBeInTheDocument();
    });

    it("shows error toast when cart validation fails", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /Checkout/i,
            })
        );

        const { onError } =
            validateCartMock.mock.calls[0][1] as MutateOptions<{
                isValid: boolean;
                invalidItems: InvalidCartItem[];
            }>;

        onError();

        expect(showToast).toHaveBeenCalledWith(
            "Failed to validate cart",
            "error"
        );
    });

    it("clears an item's validation error and revalidates the cart", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        // Initial validation.
        fireEvent.click(
            screen.getByRole("button", {
                name: /Checkout/i,
            })
        );

        const { onSuccess: initialOnSuccess } =
            validateCartMock.mock.calls[0][1] as MutateOptions<{
                isValid: boolean;
                invalidItems: InvalidCartItem[];
            }>;

        act(() => {
            initialOnSuccess({
                isValid: false,
                invalidItems: [
                    {
                        bookId: "1",
                        reason: "Out of stock",
                    },
                ],
            });
        });

        expect(
            screen.getByText("Out of stock")
        ).toBeInTheDocument();

        // Clear the item's error.
        fireEvent.click(
            screen.getByRole("button", {
                name: /Clear Error Atomic Habits/i,
            })
        );

        expect(validateCartMock).toHaveBeenCalledTimes(2);

        const { onSuccess: revalidateOnSuccess } =
            validateCartMock.mock.calls[1][1] as MutateOptions<{
                isValid: boolean;
                invalidItems: InvalidCartItem[];
            }>;

        act(() => {
            revalidateOnSuccess({
                isValid: true,
                invalidItems: [],
            });
        });

        expect(
            screen.queryByText("Out of stock")
        ).not.toBeInTheDocument();
    });

    it("keeps validation error when revalidation still returns invalid items", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /Checkout/i,
            })
        );

        const { onSuccess: initialOnSuccess } =
            validateCartMock.mock.calls[0][1] as MutateOptions<{
                isValid: boolean;
                invalidItems: InvalidCartItem[];
            }>;

        act(() => {
            initialOnSuccess({
                isValid: false,
                invalidItems: [
                    {
                        bookId: "1",
                        reason: "Out of stock",
                    },
                ],
            });
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /Clear Error Atomic Habits/i,
            })
        );

        const { onSuccess: revalidateOnSuccess } =
            validateCartMock.mock.calls[1][1] as MutateOptions<{
                isValid: boolean;
                invalidItems: InvalidCartItem[];
            }>;

        act(() => {
            revalidateOnSuccess({
                isValid: false,
                invalidItems: [
                    {
                        bookId: "1",
                        reason: "Still unavailable",
                    },
                ],
            });
        });

        expect(
            screen.getByText("Still unavailable")
        ).toBeInTheDocument();
    });

    it("shows error toast when revalidation fails after clearing item error", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /Clear Error Atomic Habits/i,
            })
        );

        expect(validateCartMock).toHaveBeenCalledTimes(1);

        const { onError } =
            validateCartMock.mock.calls[0][1] as MutateOptions<{
                isValid: boolean;
                invalidItems: InvalidCartItem[];
            }>;

        onError();

        expect(showToast).toHaveBeenCalledWith(
            "Failed to validate cart",
            "error"
        );
    });
});
