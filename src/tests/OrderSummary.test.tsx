import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import OrderSummary from "../components/OrderSummary";
import { CartSummary } from "../types/cart";

// Mock CheckoutPage
vi.mock("../pages/CheckoutPage", () => ({
    default: ({ totalAmount }: { totalAmount: number }) => (
        <div data-testid="checkout-page">
            Checkout Page - ₹{totalAmount}
        </div>
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

describe("OrderSummary", () => {
    it("renders the order summary heading", () => {
        render(
            <OrderSummary
                summary={mockSummary}
                itemCount={2}
            />
        );

        expect(screen.getByText("Order Summary")).toBeInTheDocument();
    });

    it("displays all summary values", () => {
        render(
            <OrderSummary
                summary={mockSummary}
                itemCount={2}
            />
        );

        expect(screen.getByText("Rental Charges (2 Books)")).toBeInTheDocument();
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

    it("shows singular book label when itemCount is 1", () => {
        render(
            <OrderSummary
                summary={mockSummary}
                itemCount={1}
            />
        );

        expect(screen.getByText("Rental Charges (1 Book)")).toBeInTheDocument();
    });

    it("shows zero delivery fee and total when cart is empty", () => {
        render(
            <OrderSummary
                summary={mockSummary}
                itemCount={0}
            />
        );

        expect(screen.getByText("Rental Charges (0 Books)")).toBeInTheDocument();

        const zeroValues = screen.getAllByText("₹0");
        expect(zeroValues).toHaveLength(2);
    });

    it("renders the checkout button", () => {
        render(
            <OrderSummary
                summary={mockSummary}
                itemCount={2}
            />
        );

        expect(
            screen.getByRole("button", {
                name: /proceed to checkout/i,
            })
        ).toBeInTheDocument();
    });

    it("opens the checkout modal when Proceed to Checkout is clicked", () => {
        render(
            <OrderSummary
                summary={mockSummary}
                itemCount={2}
            />
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /proceed to checkout/i,
            })
        );

        expect(screen.getByText("Checkout")).toBeInTheDocument();

        expect(screen.getByTestId("checkout-page")).toBeInTheDocument();

        expect(
            screen.getByText("Checkout Page - ₹1575")
        ).toBeInTheDocument();
    });

    it("passes the correct total amount to CheckoutPage", () => {
        render(
            <OrderSummary
                summary={mockSummary}
                itemCount={2}
            />
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /proceed to checkout/i,
            })
        );

        expect(
            screen.getByText("Checkout Page - ₹1575")
        ).toBeInTheDocument();
    });

    it("closes the modal when the header close button is clicked", () => {
        render(
            <OrderSummary
                summary={mockSummary}
                itemCount={2}
            />
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /proceed to checkout/i,
            })
        );

        expect(screen.getByText("Checkout")).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: /close modal/i,
            })
        );

        expect(screen.queryByText("Checkout")).not.toBeInTheDocument();
    });

    it("re-opens the modal after being closed", () => {
        render(
            <OrderSummary
                summary={mockSummary}
                itemCount={2}
            />
        );

        const openButton = screen.getByRole("button", {
            name: /proceed to checkout/i,
        });

        fireEvent.click(openButton);
        expect(screen.getByText("Checkout")).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: /close modal/i,
            })
        );
        expect(screen.queryByText("Checkout")).not.toBeInTheDocument();

        fireEvent.click(openButton);
        expect(screen.getByText("Checkout")).toBeInTheDocument();
    });
});