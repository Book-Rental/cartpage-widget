import type { ReactNode } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import CartPage from "../pages/CartPage";
import { useCart } from "../hooks/useCart";
import { CartData, CartItemType } from "../types/cart";
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

interface ClearCartMutateOptions {
    onSuccess: () => void;
    onError: () => void;
}

const clearCartMock = vi.fn();

vi.mock("../hooks/useCart", () => ({
    useCart: vi.fn(),
}));

vi.mock("../hooks/useClearCart", () => ({
    useClearCart: () => ({
        mutate: clearCartMock,
        isPending: false,
    }),
}));

vi.mock("../utils/ToastFunction", () => ({
    showToast: vi.fn(),
}));

vi.mock("../components/CartItem", () => ({
    default: ({ item }: { item: CartItemType }) => (
        <div>
            <div>{item.bookId.name}</div>
            <div>{item.bookId.author}</div>
        </div>
    ),
}));

vi.mock("../components/OrderSummary", () => ({
    default: () => <div>Order Summary Component</div>,
}));


vi.mock("@rentbook/rentbook-ui-lib", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@rentbook/rentbook-ui-lib")>();
    return {
        ...actual,
        Modal: ({ isOpen, onClose, children }: MockModalProps) =>
            isOpen ? (
                <div data-testid="modal">
                    <button data-testid="modal-backdrop-close" onClick={onClose}>
                        Backdrop Close
                    </button>
                    {children}
                </div>
            ) : null,
        ModalHeader: ({ onClose, children }: MockModalHeaderProps) => (
            <div>
                <span>{children}</span>
                <button data-testid="modal-header-close" onClick={onClose}>
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

        expect(screen.getByText(/Loading cart details/i)).toBeInTheDocument();
    });

    it("shows error message", () => {
        mockUseCart.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        });

        render(<CartPage />);

        expect(screen.getByText(/Failed to load cart/i)).toBeInTheDocument();
    });

    it("renders cart data", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        expect(screen.getByText("Atomic Habits")).toBeInTheDocument();
        expect(screen.getByText("James Clear")).toBeInTheDocument();
        expect(
            screen.getByText("Order Summary Component")
        ).toBeInTheDocument();
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

        expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Browse Books/i,
            })
        );

        expect(pushSpy).toHaveBeenCalledWith({}, "", "/books");
        expect(dispatchSpy).toHaveBeenCalled();
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
            screen.getByText(/Are you sure you want to remove all books/i)
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: /Cancel/i,
            })
        );

        expect(
            screen.queryByText(/Are you sure you want to remove all books/i)
        ).not.toBeInTheDocument();
    });

    it("closes the clear cart modal via the modal's onClose (backdrop)", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        fireEvent.click(screen.getByRole("button", { name: /Clear Cart/i }));
        expect(
            screen.getByText(/Are you sure you want to remove all books/i)
        ).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("modal-backdrop-close"));

        expect(
            screen.queryByText(/Are you sure you want to remove all books/i)
        ).not.toBeInTheDocument();
    });

    it("closes the clear cart modal via the modal header's onClose", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        fireEvent.click(screen.getByRole("button", { name: /Clear Cart/i }));
        expect(
            screen.getByText(/Are you sure you want to remove all books/i)
        ).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("modal-header-close"));

        expect(
            screen.queryByText(/Are you sure you want to remove all books/i)
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
    });

    it("closes the modal and shows a success toast when clearing the cart succeeds", async () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        fireEvent.click(screen.getByRole("button", { name: /Clear Cart/i }));

        expect(
            screen.getByText(/Are you sure you want to remove all books/i)
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getAllByRole("button", { name: /Clear Cart/i })[1]
        );

        const { onSuccess } = clearCartMock.mock.calls[0][1] as ClearCartMutateOptions;

        onSuccess();

        await waitFor(() => {
            expect(
                screen.queryByText(/Are you sure you want to remove all books/i)
            ).not.toBeInTheDocument();
        });

        expect(showToast).toHaveBeenCalledWith(
            "Cart cleared successfully"
        );
    });

    it("shows an error toast when clearing the cart fails", () => {
        mockUseCart.mockReturnValue({
            data: cartData,
            isLoading: false,
            isError: false,
        });

        render(<CartPage />);

        fireEvent.click(screen.getByRole("button", { name: /Clear Cart/i }));
        fireEvent.click(
            screen.getAllByRole("button", { name: /Clear Cart/i })[1]
        );

        const { onError } = clearCartMock.mock.calls[0][1] as ClearCartMutateOptions;
        onError();

        expect(showToast).toHaveBeenCalledWith("Failed to clear cart", "error");
    });
});