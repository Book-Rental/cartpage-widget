import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";

import OrderSummary from "../components/OrderSummary";
import {
    Address,
    CartSummary,
    InvalidCartItem,
} from "../types/cart";
import { showToast } from "../utils/ToastFunction";

vi.mock("../utils/ToastFunction", () => ({
    showToast: vi.fn(),
}));

vi.mock("../pages/CheckoutPage", () => ({
    default: ({ totalAmount }: { totalAmount: number }) => (
        <div data-testid="checkout-page">
            Checkout Page - ₹{totalAmount}
        </div>
    ),
}));

vi.mock("../components/ReviewStep", () => ({
    default: ({ address }: { address: Address | null }) => (
        <div data-testid="review-step">
            <div>{address?.street}</div>
        </div>
    ),
}));
vi.mock("../pages/AddressSelectionStep", () => ({
    default: ({
        onAddressSelected,
    }: {
        onAddressSelected: (address: Address) => void;
    }) => (
        <div data-testid="address-step">
            <button
                onClick={() =>
                    onAddressSelected({
                        _id: "1",
                        name: "Geethika K",
                        type: "work",
                        street: "road no 2",
                        city: "Hyderabad",
                        state: "Telangana",
                        zipCode: "500096",
                        country: "India",
                        phone: "7867546789",
                        isDefault: true,
                    })
                }
            >
                Mock Select Address
            </button>
        </div>
    ),
}));

let nextValidationResult: {
    isValid: boolean;
    invalidItems: InvalidCartItem[];
} = {
    isValid: true,
    invalidItems: [],
};

let shouldThrowError = false;

const mutateMock = vi.fn(
    (
        _: unknown,
        options?: {
            onSuccess?: (data: {
                isValid: boolean;
                invalidItems: InvalidCartItem[];
            }) => void;
            onError?: () => void;
        }
    ) => {
        if (shouldThrowError) {
            options?.onError?.();
            return;
        }

        options?.onSuccess?.(nextValidationResult);
    }
);

vi.mock("../hooks/useValidateCart", () => ({
    useValidateCart: () => ({
        mutate: mutateMock,
        isPending: false,
    }),
}));

const mockedShowToast = vi.mocked(showToast);

const mockSummary: CartSummary = {
    subtotal: 500,
    securityDepositTotal: 1000,
    deliveryFee: 50,
    tax: 25,
    total: 1575,
    items: [],
};
function renderComponent(
    itemCount = 2,
    onValidationResult = vi.fn<(items: InvalidCartItem[]) => void>()
) {
    const queryClient = new QueryClient();

    return render(
        <QueryClientProvider client={queryClient}>
            <OrderSummary
                summary={mockSummary}
                itemCount={itemCount}
                onValidationResult={onValidationResult}
            />
        </QueryClientProvider>
    );
}

describe("OrderSummary", () => {
    beforeEach(() => {
        mutateMock.mockClear();
        mockedShowToast.mockClear();

        shouldThrowError = false;

        nextValidationResult = {
            isValid: true,
            invalidItems: [],
        };
    });

    it("renders the order summary heading", () => {
        renderComponent();

        expect(
            screen.getByText("Order Summary")
        ).toBeInTheDocument();
    });

    it("displays all summary values", () => {
        renderComponent();

        expect(
            screen.getByText("Rental Charges (2 Books)")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Security Deposit")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Delivery Charges")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Tax")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Total Amount")
        ).toBeInTheDocument();

        expect(screen.getByText("₹500")).toBeInTheDocument();
        expect(screen.getByText("₹1000")).toBeInTheDocument();
        expect(screen.getByText("₹50")).toBeInTheDocument();
        expect(screen.getByText("₹25.00")).toBeInTheDocument();
        expect(screen.getByText("₹1575")).toBeInTheDocument();
    });

    it("shows singular book label", () => {
        renderComponent(1);

        expect(
            screen.getByText("Rental Charges (1 Book)")
        ).toBeInTheDocument();
    });

    it("shows zero delivery fee and total when cart is empty", () => {
        renderComponent(0);

        expect(
            screen.getByText("Rental Charges (0 Books)")
        ).toBeInTheDocument();

        expect(screen.getAllByText("₹0")).toHaveLength(2);
    });

    it("renders checkout button", () => {
        renderComponent();

        expect(
            screen.getByRole("button", {
                name: /proceed to checkout/i,
            })
        ).toBeInTheDocument();
    });

    it("calls onValidationResult on successful validation", () => {
        const callback = vi.fn<(items: InvalidCartItem[]) => void>();

        renderComponent(2, callback);

        fireEvent.click(
            screen.getByRole("button", {
                name: /proceed to checkout/i,
            })
        );

        expect(mutateMock).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith([]);

        expect(
            screen.getByTestId("address-step")
        ).toBeInTheDocument();
    });
    it("shows retry option when validation API fails", () => {
        shouldThrowError = true;

        renderComponent();

        fireEvent.click(
            screen.getByRole("button", {
                name: /proceed to checkout/i,
            })
        );

        expect(mockedShowToast).toHaveBeenCalledWith(
            "Failed to validate cart",
            "error"
        );

        expect(
            screen.getByRole("button", {
                name: /retry validation/i,
            })
        ).toBeInTheDocument();
    });

    it("shows toast when validation returns invalid items", () => {
        nextValidationResult = {
            isValid: false,
            invalidItems: [] as InvalidCartItem[],
        };

        renderComponent();

        fireEvent.click(
            screen.getByRole("button", {
                name: /proceed to checkout/i,
            })
        );

        expect(mockedShowToast).toHaveBeenCalledWith(
            "Some items in your cart are invalid",
            "error"
        );
    });

    it("moves from address to review", () => {
        renderComponent();

        fireEvent.click(
            screen.getByRole("button", {
                name: /proceed to checkout/i,
            })
        );

        fireEvent.click(screen.getByText("Mock Select Address"));

        fireEvent.click(
            screen.getByRole("button", {
                name: /continue to review/i,
            })
        );

        expect(
            screen.getByTestId("review-step")
        ).toBeInTheDocument();
        expect(
            screen.getByText(/road no 2/i)
        ).toBeInTheDocument();
    });

    it("moves from review to payment", () => {
        renderComponent();

        fireEvent.click(
            screen.getByRole("button", {
                name: /proceed to checkout/i,
            })
        );

        fireEvent.click(screen.getByText("Mock Select Address"));

        fireEvent.click(
            screen.getByRole("button", {
                name: /continue to review/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /continue to payment/i,
            })
        );

        expect(
            screen.getByTestId("checkout-page")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Checkout Page - ₹1575")
        ).toBeInTheDocument();
    });

    it("goes back from review to address", () => {
        renderComponent();

        fireEvent.click(
            screen.getByRole("button", {
                name: /proceed to checkout/i,
            })
        );

        fireEvent.click(screen.getByText("Mock Select Address"));

        fireEvent.click(
            screen.getByRole("button", {
                name: /continue to review/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /back to address/i,
            })
        );

        expect(
            screen.getByTestId("address-step")
        ).toBeInTheDocument();
    });

    it("goes back from payment to review", () => {
        renderComponent();

        fireEvent.click(
            screen.getByRole("button", {
                name: /proceed to checkout/i,
            })
        );

        fireEvent.click(screen.getByText("Mock Select Address"));

        fireEvent.click(
            screen.getByRole("button", {
                name: /continue to review/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /continue to payment/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /back to review/i,
            })
        );

        expect(
            screen.getByTestId("review-step")
        ).toBeInTheDocument();
    });
    it("closes the modal when the close button is clicked", () => {
        renderComponent();

        fireEvent.click(
            screen.getByRole("button", {
                name: /proceed to checkout/i,
            })
        );

        expect(
            screen.getByText("Checkout Progress")
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: /close modal/i,
            })
        );

        expect(
            screen.queryByText("Checkout Progress")
        ).not.toBeInTheDocument();
    });

    it("reopens the modal after closing", () => {
        renderComponent();

        const openButton = screen.getByRole("button", {
            name: /proceed to checkout/i,
        });

        fireEvent.click(openButton);

        expect(
            screen.getByText("Checkout Progress")
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: /close modal/i,
            })
        );

        expect(
            screen.queryByText("Checkout Progress")
        ).not.toBeInTheDocument();

        fireEvent.click(openButton);

        expect(
            screen.getByText("Checkout Progress")
        ).toBeInTheDocument();

        expect(mutateMock).toHaveBeenCalledTimes(2);
    });

    it("retries validation after failure", () => {
        shouldThrowError = true;

        renderComponent();

        fireEvent.click(
            screen.getByRole("button", {
                name: /proceed to checkout/i,
            })
        );

        const retryButton = screen.getByRole("button", {
            name: /retry validation/i,
        });

        fireEvent.click(retryButton);

        expect(mutateMock).toHaveBeenCalledTimes(2);
    });

    it("passes the correct total amount to CheckoutPage", () => {
        renderComponent();

        fireEvent.click(
            screen.getByRole("button", {
                name: /proceed to checkout/i,
            })
        );

        fireEvent.click(screen.getByText("Mock Select Address"));

        fireEvent.click(
            screen.getByRole("button", {
                name: /continue to review/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /continue to payment/i,
            })
        );

        expect(
            screen.getByText("Checkout Page - ₹1575")
        ).toBeInTheDocument();
    });
});