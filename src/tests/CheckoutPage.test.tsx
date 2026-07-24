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
import * as useClearCartModule from "../hooks/useClearCart";

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

vi.mock("../hooks/useClearCart", () => ({
    useClearCart: vi.fn(),
}));

// The spinner just needs to render something identifiable; avoid pulling in
// the real UI lib during tests.
vi.mock("@rentbook/rentbook-ui-lib", () => ({
    Rb_LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));

const mockUseCheckout = vi.mocked(CheckoutContextModule.useCheckout);
const mockUsePlaceOrder = vi.mocked(usePlaceOrderModule.usePlaceOrder);
const mockUseClearCart = vi.mocked(useClearCartModule.useClearCart);

const setCheckoutDataMock = vi.fn();
const placeOrderMock = vi.fn();
const clearCartMock = vi.fn();

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
        clearCartMock.mockClear();

        mockUsePlaceOrder.mockReturnValue({
            mutate: placeOrderMock,
        } as unknown as ReturnType<typeof usePlaceOrderModule.usePlaceOrder>);

        mockUseClearCart.mockReturnValue({
            mutate: clearCartMock,
            isPending: false,
        } as unknown as ReturnType<typeof useClearCartModule.useClearCart>);
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

    it("renders the loading spinner instead of the widget while clearing the cart", () => {
        mockUseClearCart.mockReturnValue({
            mutate: clearCartMock,
            isPending: true,
        } as unknown as ReturnType<typeof useClearCartModule.useClearCart>);

        const { container, getByTestId } = renderCheckoutPage(250);

        expect(getByTestId("loading-spinner")).toBeInTheDocument();
        expect(
            container.querySelector("#test-widget-container")
        ).not.toBeInTheDocument();
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

    it("does not inject the script when the widget url is not configured", () => {
        vi.stubEnv("VITE_PAYMENT_WIDGET_URL", "");

        renderCheckoutPage(100);

        expect(document.querySelector("script[src]")).not.toBeInTheDocument();
        expect(renderReactWidgetMock).not.toHaveBeenCalled();
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

    it("places an order with the payment details on a payment-widget-success event", () => {
        renderCheckoutPage(500);

        act(() => {
            window.dispatchEvent(
                new CustomEvent("payment-widget-success", {
                    detail: {
                        paymentMethod: "UPI",
                        transactionId: "TXN123",
                        paymentStatus: "SUCCESS",
                    },
                })
            );
        });

        expect(setCheckoutDataMock).toHaveBeenCalledWith(
            expect.objectContaining({
                payment: {
                    paymentMethod: "UPI",
                    transactionId: "TXN123",
                    paymentStatus: "SUCCESS",
                },
            })
        );

        expect(placeOrderMock).toHaveBeenCalledWith(
            expect.objectContaining({
                payment: {
                    paymentMethod: "UPI",
                    transactionId: "TXN123",
                    paymentStatus: "SUCCESS",
                },
            }),
            expect.objectContaining({
                onSuccess: expect.any(Function),
                onError: expect.any(Function),
            })
        );
    });

    it("defaults paymentStatus to SUCCESS when not provided on a payment-widget-success event", () => {
        renderCheckoutPage(500);

        act(() => {
            window.dispatchEvent(
                new CustomEvent("payment-widget-success", {
                    detail: {
                        paymentMethod: "UPI",
                        transactionId: "TXN123",
                    },
                })
            );
        });

        expect(placeOrderMock).toHaveBeenCalledWith(
            expect.objectContaining({
                payment: expect.objectContaining({
                    paymentStatus: "SUCCESS",
                }),
            }),
            expect.anything()
        );
    });

    it("places a COD/FAILED order on a payment-widget-failure event", () => {
        const logSpy = vi
            .spyOn(console, "log")
            .mockImplementation(() => { });

        renderCheckoutPage(500);

        act(() => {
            window.dispatchEvent(
                new CustomEvent("payment-widget-failure", {
                    detail: { reason: "declined" },
                })
            );
        });

        expect(logSpy).toHaveBeenCalledWith("Payment failed", {
            reason: "declined",
        });

        expect(placeOrderMock).toHaveBeenCalledWith(
            expect.objectContaining({
                payment: {
                    paymentMethod: "COD",
                    transactionId: "",
                    paymentStatus: "FAILED",
                },
            }),
            expect.anything()
        );

        logSpy.mockRestore();
    });

    it("on successful order placement: logs, clears the cart, and navigates to /OrderConform", () => {
        const logSpy = vi
            .spyOn(console, "log")
            .mockImplementation(() => { });
        const pushStateSpy = vi.spyOn(window.history, "pushState");
        const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

        placeOrderMock.mockImplementation((_payload, options) => {
            options?.onSuccess?.();
        });

        renderCheckoutPage(500);

        act(() => {
            window.dispatchEvent(
                new CustomEvent("payment-widget-success", {
                    detail: {
                        paymentMethod: "UPI",
                        transactionId: "TXN123",
                        paymentStatus: "SUCCESS",
                    },
                })
            );
        });

        expect(logSpy).toHaveBeenCalledWith("Order placed successfully");
        expect(clearCartMock).toHaveBeenCalled();
        expect(pushStateSpy).toHaveBeenCalledWith({}, "", "/OrderConform");
        expect(dispatchEventSpy).toHaveBeenCalledWith(
            expect.objectContaining({ type: "popstate" })
        );

        logSpy.mockRestore();
        pushStateSpy.mockRestore();
        dispatchEventSpy.mockRestore();
    });

    it("logs a failure message when placeOrder errors, without clearing the cart", () => {
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
                        paymentMethod: "UPI",
                        transactionId: "TXN123",
                        paymentStatus: "SUCCESS",
                    },
                })
            );
        });

        expect(logSpy).toHaveBeenCalledWith("Order placement failed");
        expect(clearCartMock).not.toHaveBeenCalled();

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

    it("removes payment event listeners on unmount", () => {
        const logSpy = vi
            .spyOn(console, "log")
            .mockImplementation(() => { });

        const { unmount } = renderCheckoutPage(500);

        unmount();

        act(() => {
            window.dispatchEvent(
                new CustomEvent("payment-widget-success", {
                    detail: {
                        paymentMethod: "UPI",
                        transactionId: "TXN123",
                        paymentStatus: "SUCCESS",
                    },
                })
            );

            window.dispatchEvent(
                new CustomEvent("payment-widget-failure", {
                    detail: { reason: "declined" },
                })
            );
        });

        expect(placeOrderMock).not.toHaveBeenCalled();
        expect(logSpy).not.toHaveBeenCalledWith(
            "Payment failed",
            expect.anything()
        );

        logSpy.mockRestore();
    });
});