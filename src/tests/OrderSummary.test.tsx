import type { ReactNode, ButtonHTMLAttributes, HTMLAttributes } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import OrderSummary from "../components/OrderSummary";
import { CartSummary } from "../types/cart";

interface MockTextProps extends HTMLAttributes<HTMLSpanElement> {
    children: ReactNode;
    variant?: string;
}

interface MockButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
}

// The real UI lib components pull in styling/behavior we don't need to
// exercise here — just render enough markup for RTL queries to work.
vi.mock("@rentbook/rentbook-ui-lib", () => ({
    Rb_Text: ({ children, ...props }: MockTextProps) => (
        <span {...props}>{children}</span>
    ),
    Rb_Button: ({ children, onClick, ...props }: MockButtonProps) => (
        <button onClick={onClick} {...props}>
            {children}
        </button>
    ),
}));

const mockSummary: CartSummary = {
    subtotal: 500,
    securityDepositTotal: 1000,
    deliveryFee: 50,
    tax: 25,
    total: 1575,
    items: [],
};

const onCheckoutMock = vi.fn();

const renderComponent = (itemCount = 2, summary = mockSummary) =>
    render(
        <OrderSummary
            summary={summary}
            itemCount={itemCount}
            onCheckout={onCheckoutMock}
        />
    );

const pushStateSpy = vi.spyOn(window.history, "pushState");
const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

describe("OrderSummary", () => {
    beforeEach(() => {
        onCheckoutMock.mockClear();
        pushStateSpy.mockClear();
        dispatchEventSpy.mockClear();
    });

    afterEach(() => {
        delete (window as any).HOST_USER_INFO;
    });

    describe("when user is logged in", () => {
        beforeEach(() => {
            (window as any).HOST_USER_INFO = { _id: "user1", name: "Test" };
        });

        it("renders the order summary heading", () => {
            renderComponent();

            expect(screen.getByText("Order Summary")).toBeInTheDocument();
        });

        it("displays all summary values", () => {
            renderComponent();

            expect(
                screen.getByText("Rental Charges (2 Books)")
            ).toBeInTheDocument();

            expect(screen.getByText("Security Deposit")).toBeInTheDocument();
            expect(screen.getByText("Delivery Charges")).toBeInTheDocument();
            expect(screen.getByText("Tax")).toBeInTheDocument();
            expect(screen.getByText("Total Amount")).toBeInTheDocument();

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

        it("renders 'Proceed to Checkout' button when the cart has items", () => {
            renderComponent();

            expect(
                screen.getByRole("button", { name: /proceed to checkout/i })
            ).toBeInTheDocument();
        });

        it("calls onCheckout when 'Proceed to Checkout' button is clicked", () => {
            renderComponent();

            fireEvent.click(
                screen.getByRole("button", { name: /proceed to checkout/i })
            );

            expect(onCheckoutMock).toHaveBeenCalledTimes(1);
        });

        it("does NOT navigate to /auth when checkout button is clicked", () => {
            renderComponent();

            fireEvent.click(
                screen.getByRole("button", { name: /proceed to checkout/i })
            );

            expect(pushStateSpy).not.toHaveBeenCalled();
            expect(dispatchEventSpy).not.toHaveBeenCalled();
        });

        it("shows an empty-cart message and hides the summary when itemCount is 0", () => {
            renderComponent(0);

            expect(
                screen.getByText(
                    "Add books to your cart to view the order summary."
                )
            ).toBeInTheDocument();

            // Heading still renders, but nothing else from the summary body should.
            expect(
                screen.queryByText(/Rental Charges/)
            ).not.toBeInTheDocument();
            expect(screen.queryByText("Security Deposit")).not.toBeInTheDocument();
            expect(screen.queryByText("Delivery Charges")).not.toBeInTheDocument();
            expect(screen.queryByText("Tax")).not.toBeInTheDocument();
            expect(screen.queryByText("Total Amount")).not.toBeInTheDocument();
            expect(
                screen.queryByRole("button", { name: /proceed to checkout/i })
            ).not.toBeInTheDocument();
        });

        it("does not call onCheckout when the cart is empty (no button to click)", () => {
            renderComponent(0);

            expect(
                screen.queryByRole("button", { name: /proceed to checkout/i })
            ).not.toBeInTheDocument();
            expect(onCheckoutMock).not.toHaveBeenCalled();
        });
    });

    describe("when user is NOT logged in", () => {
        beforeEach(() => {
            (window as any).HOST_USER_INFO = undefined;
        });

        it("renders 'Login to Proceed' button when the cart has items", () => {
            renderComponent();

            expect(
                screen.getByRole("button", { name: /login to proceed/i })
            ).toBeInTheDocument();
        });

        it("navigates to /auth when 'Login to Proceed' button is clicked", () => {
            renderComponent();

            fireEvent.click(
                screen.getByRole("button", { name: /login to proceed/i })
            );

            expect(pushStateSpy).toHaveBeenCalledWith({}, "", "/auth");
            expect(dispatchEventSpy).toHaveBeenCalledWith(
                new PopStateEvent("popstate")
            );
        });

        it("does NOT call onCheckout when 'Login to Proceed' button is clicked", () => {
            renderComponent();

            fireEvent.click(
                screen.getByRole("button", { name: /login to proceed/i })
            );

            expect(onCheckoutMock).not.toHaveBeenCalled();
        });

        it("shows an empty-cart message and hides the button when itemCount is 0", () => {
            renderComponent(0);

            expect(
                screen.getByText(
                    "Add books to your cart to view the order summary."
                )
            ).toBeInTheDocument();

            expect(
                screen.queryByRole("button", { name: /login to proceed/i })
            ).not.toBeInTheDocument();
            expect(
                screen.queryByRole("button", { name: /proceed to checkout/i })
            ).not.toBeInTheDocument();
        });
    });
});
