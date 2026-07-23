import {
    render,
    screen,
    fireEvent,
} from "@testing-library/react";
import { describe, it, expect } from "vitest";

import {
    CheckoutProvider,
    useCheckout,
} from "../hooks/CheckoutContext";

function TestComponent() {
    const {
        step,
        setStep,
        checkoutData,
        setCheckoutData,
        resetCheckout,
    } = useCheckout();

    return (
        <>
            <div data-testid="step">{step}</div>
            <div data-testid="userId">
                {checkoutData.userId}
            </div>

            <button
                onClick={() => setStep("address")}
            >
                Change Step
            </button>

            <button
                onClick={() =>
                    setCheckoutData({
                        userId: "user123",
                        items: [
                            {
                                bookId: "book1",
                                quantity: 2,
                                rentalType: "monthly",
                            },
                        ],
                        shippingAddress: null,
                        billingAddress: null,
                        payment: null,
                        amount: {
                            rentalAmount: 100,
                            securityDeposit: 50,
                            deliveryFee: 20,
                            discount: 10,
                            tax: 18,
                            totalAmount: 178,
                        },
                    })
                }
            >
                Set Checkout
            </button>

            <button onClick={resetCheckout}>
                Reset
            </button>
        </>
    );
}

describe("CheckoutContext", () => {
    it("renders children", () => {
        render(
            <CheckoutProvider>
                <div>Child Component</div>
            </CheckoutProvider>
        );

        expect(
            screen.getByText("Child Component")
        ).toBeInTheDocument();
    });

    it("provides default values", () => {
        render(
            <CheckoutProvider>
                <TestComponent />
            </CheckoutProvider>
        );

        expect(
            screen.getByTestId("step")
        ).toHaveTextContent("validation");

        expect(
            screen.getByTestId("userId")
        ).toHaveTextContent("");
    });

    it("updates checkout step", () => {
        render(
            <CheckoutProvider>
                <TestComponent />
            </CheckoutProvider>
        );

        fireEvent.click(
            screen.getByText("Change Step")
        );

        expect(
            screen.getByTestId("step")
        ).toHaveTextContent("address");
    });

    it("updates checkout data", () => {
        render(
            <CheckoutProvider>
                <TestComponent />
            </CheckoutProvider>
        );

        fireEvent.click(
            screen.getByText("Set Checkout")
        );

        expect(
            screen.getByTestId("userId")
        ).toHaveTextContent("user123");
    });

    it("resets checkout data and step", () => {
        render(
            <CheckoutProvider>
                <TestComponent />
            </CheckoutProvider>
        );

        fireEvent.click(
            screen.getByText("Change Step")
        );

        fireEvent.click(
            screen.getByText("Set Checkout")
        );

        fireEvent.click(
            screen.getByText("Reset")
        );

        expect(
            screen.getByTestId("step")
        ).toHaveTextContent("validation");

        expect(
            screen.getByTestId("userId")
        ).toHaveTextContent("");
    });

    it("throws error when useCheckout is used outside provider", () => {
        const Consumer = () => {
            useCheckout();
            return null;
        };

        expect(() =>
            render(<Consumer />)
        ).toThrow(
            "useCheckout must be used within CheckoutProvider"
        );
    });
});