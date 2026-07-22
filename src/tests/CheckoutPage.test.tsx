import {
    render,
    waitFor,
    cleanup,
    act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CheckoutPage from "../pages/CheckoutPage";

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
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
        document.body.innerHTML = "";
    });

    it("renders the payment widget container", () => {
        const { container } = render(
            <CheckoutPage totalAmount={250} />
        );

        expect(
            container.querySelector("#test-widget-container")
        ).toBeInTheDocument();
    });

    it("sets all required data attributes", () => {
        const { container } = render(
            <CheckoutPage totalAmount={500} />
        );

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
        render(<CheckoutPage totalAmount={100} />);

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

        render(<CheckoutPage totalAmount={500} />);

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

    it("cleans up on unmount", () => {
        const { unmount } = render(
            <CheckoutPage totalAmount={100} />
        );

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

        const { unmount } = render(
            <CheckoutPage totalAmount={500} />
        );

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

        expect(logSpy).not.toHaveBeenCalled();

        logSpy.mockRestore();
    });

    it("does not throw during cleanup if the script was already removed from the DOM", () => {
        const { unmount } = render(
            <CheckoutPage totalAmount={100} />
        );

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

        render(<CheckoutPage totalAmount={100} />);

        expect(
            document.querySelector(
                'script[src="https://example.com/widget.js"]'
            )
        ).not.toBeInTheDocument();

        expect(renderReactWidgetMock).not.toHaveBeenCalled();
    });
});