import {
    render,
    waitFor,
    cleanup,
    act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CheckoutPage from "../pages/CheckoutPage";
import * as CheckoutContextModule from "../hooks/CheckoutContext";
import * as usePlaceOrderModule from "../hooks/usePlaceOrder";

vi.mock("../hooks/CheckoutContext", async () => {
    const actual = await vi.importActual<
        typeof import("../hooks/CheckoutContext")
    >("../hooks/CheckoutContext");
    return {
        ...actual,
        useCheckout: vi.fn(),
    };
});

vi.mock("../hooks/usePlaceOrder", () => ({
    usePlaceOrder: vi.fn(),
}));

const mockUseCheckout = vi.mocked(CheckoutContextModule.useCheckout);
const mockUsePlaceOrder = vi.mocked(usePlaceOrderModule.usePlaceOrder);

const setCheckoutDataMock = vi.fn();
const placeOrderMock = vi.fn();

const makeCheckoutData = (totalAmount: number) => ({
    userId: "",
    items: [],
    shippingAddress: null,
    billingAddress: null,
    payment: null,
    amount: {
        rentalAmount: 0,
        securityDeposit: 0,
        deliveryFee: 0,
        discount: 0,
        tax: 0,
        totalAmount,
    },
});

// Renders CheckoutPage with the context pre-seeded to a given totalAmount,
// standing in for the old `<CheckoutPage totalAmount={n} />` usage.
const renderCheckoutPage = (totalAmount: number) => {
    mockUseCheckout.mockReturnValue({
        step: "payment",
        setStep: vi.fn(),
        checkoutData: makeCheckoutData(totalAmount),
        setCheckoutData: setCheckoutDataMock,
        resetCheckout: vi.fn(),
    });

    return render(<CheckoutPage />);
};

describe("CheckoutPage", () => {
    const renderReactWidgetMock = vi.fn();
    const unmountReactWidgetMock = vi.fn();

    beforeEach(() => {
        vi.stubEnv(
            "VITE_PAYMENT_WIDGET_URL",
            "https://example.com/widget.js"
        );
        vi.stubEnv(
            "VITE_RETURN_URL",
            "https://example.com/return"
        );

        window.renderReactWidget = renderReactWidgetMock;
        window.unmountReactWidget = unmountReactWidgetMock;

        renderReactWidgetMock.mockClear();
        unmountReactWidgetMock.mockClear();
        setCheckoutDataMock.mockClear();
        placeOrderMock.mockClear();

        mockUsePlaceOrder.mockReturnValue({
            mutate: placeOrderMock,
        } as unknown as ReturnType<typeof usePlaceOrderModule.usePlaceOrder>);
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
        document.body.innerHTML = "";
    });

    it("renders the payment widget container", () => {
        const { container } = renderCheckoutPage(250);

        expect(
            container.querySelector("#test-widget-container")
        ).toBeInTheDocument();
    });

    it("sets all required data attributes", () => {
        const { container } = renderCheckoutPage(500);

        const widget = container.querySelector(
            "#test-widget-container"
        ) as HTMLElement;

        expect(widget.getAttribute("data-price")).toBe("500");
        expect(widget.getAttribute("data-merchant-name")).toBe("RentBook");
        expect(widget.getAttribute("data-currency")).toBe("INR");
        expect(widget.getAttribute("data-return-url")).toBe(
            "https://example.com/return"
        );
        expect(widget.getAttribute("data-no-forwarding-path")).toBe("true");
    });

    it("loads the payment widget script and calls renderReactWidget", async () => {
        renderCheckoutPage(100);

        const script = document.querySelector(
            'script[src="https://example.com/widget.js"]'
        ) as HTMLScriptElement;

        expect(script).toBeInTheDocument();

        script.onload?.(new Event("load"));

        await waitFor(() => {
            expect(renderReactWidgetMock).toHaveBeenCalledWith(
                JSON.stringify({
                    containerElementId: "test-widget-container",
                })
            );
        });
    });

    it("handles payment success event", () => {
        const logSpy = vi
            .spyOn(console, "log")
            .mockImplementation(() => { });

        renderCheckoutPage(500);

        act(() => {
            window.dispatchEvent(
                new CustomEvent("payment-widget-success", {
                    detail: {
                        status: "SUCCESS",
                        amount: 500,
                        currency: "INR",
                        paymentMethod: "UPI",
                        transactionId: "TXN123",
                    },
                })
            );
        });

        expect(logSpy).toHaveBeenCalledWith(
            "Payment completed successfully!",
            {
                status: "SUCCESS",
                amount: 500,
                currency: "INR",
                paymentMethod: "UPI",
                transactionId: "TXN123",
            }
        );

        logSpy.mockRestore();
    });

    it("logs a success message when placeOrder succeeds", () => {
        const logSpy = vi
            .spyOn(console, "log")
            .mockImplementation(() => { });

        placeOrderMock.mockImplementation((_payload, options) => {
            options?.onSuccess?.();
        });

        renderCheckoutPage(500);

        act(() => {
            window.dispatchEvent(
                new CustomEvent("payment-widget-success", {
                    detail: {
                        status: "SUCCESS",
                        amount: 500,
                        currency: "INR",
                        paymentMethod: "UPI",
                        transactionId: "TXN123",
                    },
                })
            );
        });

        expect(logSpy).toHaveBeenCalledWith("Order placed successfully");

        logSpy.mockRestore();
    });

    it("logs a failure message when placeOrder fails", () => {
        const logSpy = vi
            .spyOn(console, "log")
            .mockImplementation(() => { });

        placeOrderMock.mockImplementation((_payload, options) => {
            options?.onError?.();
        });

        renderCheckoutPage(500);

        act(() => {
            window.dispatchEvent(
                new CustomEvent("payment-widget-success", {
                    detail: {
                        status: "SUCCESS",
                        amount: 500,
                        currency: "INR",
                        paymentMethod: "UPI",
                        transactionId: "TXN123",
                    },
                })
            );
        });

        expect(logSpy).toHaveBeenCalledWith("Order placement failed");

        logSpy.mockRestore();
    });

    it("cleans up on unmount", () => {
        const { unmount } = renderCheckoutPage(100);

        const script = document.querySelector(
            'script[src="https://example.com/widget.js"]'
        );

        expect(script).toBeInTheDocument();

        unmount();

        expect(unmountReactWidgetMock).toHaveBeenCalledWith(
            "test-widget-container"
        );

        expect(
            document.querySelector(
                'script[src="https://example.com/widget.js"]'
            )
        ).not.toBeInTheDocument();
    });

    it("removes payment success listener on unmount", () => {
        const logSpy = vi
            .spyOn(console, "log")
            .mockImplementation(() => { });

        const { unmount } = renderCheckoutPage(500);

        // Clear out the mount-time "Checkout Payload" debug log so this
        // assertion only reflects behavior after unmount.
        logSpy.mockClear();

        unmount();

        act(() => {
            window.dispatchEvent(
                new CustomEvent("payment-widget-success", {
                    detail: {
                        status: "SUCCESS",
                        amount: 500,
                        currency: "INR",
                        paymentMethod: "UPI",
                        transactionId: "TXN123",
                    },
                })
            );
        });

        expect(logSpy).not.toHaveBeenCalledWith(
            "Payment completed successfully!",
            expect.anything()
        );

        logSpy.mockRestore();
    });

    it("does not throw during cleanup if the script was already removed from the DOM", () => {
        const { unmount } = renderCheckoutPage(100);

        const script = document.querySelector(
            'script[src="https://example.com/widget.js"]'
        ) as HTMLScriptElement;

        expect(script).toBeInTheDocument();

        document.body.removeChild(script);

        expect(() => unmount()).not.toThrow();

        expect(unmountReactWidgetMock).toHaveBeenCalledWith(
            "test-widget-container"
        );
    });

    it("does nothing and does not inject the script if the widget container is not found", () => {
        vi.spyOn(document, "getElementById").mockReturnValue(null);

        renderCheckoutPage(100);

        expect(
            document.querySelector(
                'script[src="https://example.com/widget.js"]'
            )
        ).not.toBeInTheDocument();

        expect(renderReactWidgetMock).not.toHaveBeenCalled();
    });
});