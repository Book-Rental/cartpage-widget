import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import OrderSummary from "../components/OrderSummary";
import { CartSummary } from "../types/cart";

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
});