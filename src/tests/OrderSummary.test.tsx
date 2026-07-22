import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
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

const renderComponent = (itemCount = 2) =>
    render(
        <OrderSummary
            summary={mockSummary}
            itemCount={itemCount}
        />
    );

describe("OrderSummary", () => {
    beforeEach(() => {
        window.history.pushState({}, "", "/");
        vi.restoreAllMocks();
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

    it("disables checkout button when cart is empty", () => {
        renderComponent(0);

        expect(
            screen.getByRole("button", {
                name: /proceed to checkout/i,
            })
        ).toBeDisabled();
    });

    it("navigates to checkout page", () => {
        const pushStateSpy = vi.spyOn(window.history, "pushState");
        const dispatchSpy = vi.spyOn(window, "dispatchEvent");

        renderComponent();

        fireEvent.click(
            screen.getByRole("button", {
                name: /proceed to checkout/i,
            })
        );

        expect(pushStateSpy).toHaveBeenCalledWith(
            {},
            "",
            "/checkout"
        );

        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.any(PopStateEvent)
        );
    });
});