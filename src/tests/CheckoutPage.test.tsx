import {
    act,
    cleanup,
    render,
    waitFor,
} from "@testing-library/react";

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import CheckoutPage from "../pages/CheckoutPage";

import { useCheckout } from "../hooks/CheckoutContext";
import { usePlaceOrder } from "../hooks/usePlaceOrder";
import { useClearCart } from "../hooks/useClearCart";

import type { CheckoutRequest } from "../types/checkout";

vi.mock("../hooks/CheckoutContext", () => ({
    useCheckout: vi.fn(),
}));

vi.mock("../hooks/usePlaceOrder", () => ({
    usePlaceOrder: vi.fn(),
}));

vi.mock("../hooks/useClearCart", () => ({
    useClearCart: vi.fn(),
}));

const clearCartMock = vi.fn();
const placeOrderMock = vi.fn();
const setCheckoutDataMock = vi.fn();

const originalFetch = globalThis.fetch;

const defaultCheckoutData: CheckoutRequest = {
    userId: "user123",

    items: [
        {
            bookId: "book123",
            quantity: 1,
        },
    ],

    shippingAddress: {
        name: "Test User",
        phone: "9876543210",
        type: "home",
        addressLine1: "123 Test Street",
        addressLine2: "",
        city: "Hyderabad",
        state: "Telangana",
        zipCode: "500001",
        country: "India",
    },

    billingAddress: {
        name: "Test User",
        phone: "9876543210",
        type: "home",
        addressLine1: "123 Test Street",
        addressLine2: "",
        city: "Hyderabad",
        state: "Telangana",
        zipCode: "500001",
        country: "India",
    },

    payment: null,

    orderType: "rent",

    amount: {
        itemAmount: 1000,
        rentalAmount: 100,
        securityDeposit: 200,
        deliveryFee: 50,
        discount: 0,
        tax: 50,
        totalAmount: 1400,
    },
};

type PlaceOrderOptions = {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
};

const setupCheckoutMock = (
    checkoutData: CheckoutRequest = defaultCheckoutData
) => {
    const checkoutValue = {
        checkoutData,
        setCheckoutData: setCheckoutDataMock,
        step: "payment" as const,
        setStep: vi.fn(),
        resetCheckout: vi.fn(),
    } as unknown as ReturnType<typeof useCheckout>;

    vi.mocked(useCheckout).mockReturnValue(checkoutValue);
};

const setupHooks = () => {
    const clearCartValue = {
        mutate: clearCartMock,
        isPending: false,
    } as unknown as ReturnType<typeof useClearCart>;

    vi.mocked(useClearCart).mockReturnValue(
        clearCartValue
    );

    const placeOrderValue = {
        mutate: placeOrderMock,
    } as unknown as ReturnType<typeof usePlaceOrder>;

    vi.mocked(usePlaceOrder).mockReturnValue(
        placeOrderValue
    );
};

const createResponse = (
    body: unknown,
    status = 200
): Response => {
    return new Response(
        JSON.stringify(body),
        {
            status,
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
};

beforeEach(() => {
    vi.clearAllMocks();

    setupHooks();
    setupCheckoutMock();

    vi.stubEnv(
        "VITE_PAYMENT_WIDGET_URL",
        "https://example.com/payment-widget.js"
    );

    vi.stubEnv(
        "VITE_RETURN_URL",
        "https://example.com/return"
    );

    vi.stubEnv(
        "VITE_API_BASE_URL",
        "https://example.com/api"
    );

    window.HOST_USER_INFO = {
        _id: "host-user",
    };

    window.renderReactWidget = vi.fn();
    window.unmountReactWidget = vi.fn();

    window.history.replaceState(
        {},
        "",
        "/checkout"
    );

    document.body.innerHTML = "";
});

afterEach(() => {
    cleanup();

    globalThis.fetch = originalFetch;

    vi.unstubAllEnvs();
    vi.restoreAllMocks();
});

describe("CheckoutPage", () => {
    it("renders checkout page for normal rental checkout", () => {
        render(<CheckoutPage />);

        expect(
            document.getElementById(
                "test-widget-container"
            )
        ).toBeInTheDocument();
    });

    it("uses checkout total amount for rental checkout", () => {
        render(<CheckoutPage />);

        const container =
            document.getElementById(
                "test-widget-container"
            );

        expect(container).toHaveAttribute(
            "data-price",
            "1400"
        );
    });

    it("loads payment widget script", async () => {
        render(<CheckoutPage />);

        const script =
            document.querySelector(
                'script[src="https://example.com/payment-widget.js"]'
            );

        expect(script).toBeInTheDocument();

        await actScriptLoad(script);

        expect(
            window.renderReactWidget
        ).toHaveBeenCalled();
    });

    it("sets payment widget attributes", () => {
        render(<CheckoutPage />);

        const container =
            document.getElementById(
                "test-widget-container"
            );

        expect(container).toHaveAttribute(
            "data-price",
            "1400"
        );

        expect(container).toHaveAttribute(
            "data-merchant-name",
            "RentBook"
        );

        expect(container).toHaveAttribute(
            "data-currency",
            "INR"
        );

        expect(container).toHaveAttribute(
            "data-return-url",
            "https://example.com/return"
        );

        expect(container).toHaveAttribute(
            "data-no-forwarding-path",
            "true"
        );
    });

    it("does not load payment widget when payment URL is missing", () => {
        vi.stubEnv(
            "VITE_PAYMENT_WIDGET_URL",
            ""
        );

        render(<CheckoutPage />);

        expect(
            document.querySelector("script")
        ).not.toBeInTheDocument();
    });

    it("handles successful payment and places rental order", async () => {
        placeOrderMock.mockImplementation(
            (
                _payload: CheckoutRequest,
                options?: PlaceOrderOptions
            ) => {
                options?.onSuccess?.();
            }
        );

        render(<CheckoutPage />);

        const paymentEvent = new CustomEvent(
            "payment-widget-success",
            {
                detail: {
                    paymentMethod: "CARD",
                    transactionId: "txn123",
                    paymentStatus: "SUCCESS",
                },
            }
        );

        window.dispatchEvent(paymentEvent);

        await waitFor(() => {
            expect(placeOrderMock).toHaveBeenCalled();
        });

        expect(placeOrderMock).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: "user123",
                orderType: "rent",
                payment: {
                    paymentMethod: "CARD",
                    transactionId: "txn123",
                    paymentStatus: "SUCCESS",
                },
            }),
            expect.any(Object)
        );
    });

    it("handles payment failure and creates FAILED COD order", async () => {
        render(<CheckoutPage />);

        const paymentEvent = new CustomEvent(
            "payment-widget-failure",
            {
                detail: {
                    reason: "declined",
                },
            }
        );

        window.dispatchEvent(paymentEvent);

        await waitFor(() => {
            expect(placeOrderMock).toHaveBeenCalled();
        });

        expect(placeOrderMock).toHaveBeenCalledWith(
            expect.objectContaining({
                payment: {
                    paymentMethod: "COD",
                    transactionId: "",
                    paymentStatus: "FAILED",
                },
            }),
            expect.any(Object)
        );
    });

    it("clears cart and navigates after successful order", async () => {
        placeOrderMock.mockImplementation(
            (
                _payload: CheckoutRequest,
                options?: PlaceOrderOptions
            ) => {
                options?.onSuccess?.();
            }
        );

        const pushStateSpy = vi.spyOn(
            window.history,
            "pushState"
        );

        const dispatchEventSpy = vi.spyOn(
            window,
            "dispatchEvent"
        );

        render(<CheckoutPage />);

        window.dispatchEvent(
            new CustomEvent(
                "payment-widget-success",
                {
                    detail: {
                        paymentMethod: "CARD",
                        transactionId: "txn123",
                        paymentStatus: "SUCCESS",
                    },
                }
            )
        );

        await waitFor(() => {
            expect(
                clearCartMock
            ).toHaveBeenCalled();
        });

        expect(pushStateSpy).toHaveBeenCalledWith(
            {},
            "",
            "/OrderConform"
        );

        expect(
            dispatchEventSpy
        ).toHaveBeenCalledWith(
            expect.any(PopStateEvent)
        );
    });

    it("logs order placement error when order fails", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        placeOrderMock.mockImplementation(
            (
                _payload: CheckoutRequest,
                options?: PlaceOrderOptions
            ) => {
                options?.onError?.(
                    new Error("Order failed")
                );
            }
        );

        render(<CheckoutPage />);

        window.dispatchEvent(
            new CustomEvent(
                "payment-widget-success",
                {
                    detail: {
                        paymentMethod: "CARD",
                        transactionId: "txn123",
                        paymentStatus: "SUCCESS",
                    },
                }
            )
        );

        await waitFor(() => {
            expect(
                consoleErrorSpy
            ).toHaveBeenCalledWith(
                "Order placement failed:",
                expect.any(Error)
            );
        });

        expect(
            clearCartMock
        ).not.toHaveBeenCalled();
    });

    it("fetches auction details", async () => {
        window.history.replaceState(
            {
                orderType: "auction",
                auctionId: "auction123",
                userId: "auction-user",
            },
            "",
            "/checkout"
        );

        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValue(
                createResponse(
                    {
                        message:
                            "Auction API failed",
                    },
                    500
                )
            );

        globalThis.fetch = fetchMock;

        render(<CheckoutPage />);

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                "https://example.com/api/auction/auction123/bids",
                {
                    method: "GET",
                    credentials: "include",
                }
            );
        });
    });

    it("handles auction API failure", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        window.history.replaceState(
            {
                orderType: "auction",
                auctionId: "auction123",
            },
            "",
            "/checkout"
        );

        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValue(
                createResponse(
                    {
                        message:
                            "Auction API failed",
                    },
                    500
                )
            );

        globalThis.fetch = fetchMock;

        render(<CheckoutPage />);

        await waitFor(() => {
            expect(
                consoleErrorSpy
            ).toHaveBeenCalledWith(
                "Auction details API failed:",
                expect.any(Error)
            );
        });
    });

    it("handles missing auction ID", () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        window.history.replaceState(
            {
                orderType: "auction",
            },
            "",
            "/checkout"
        );

        render(<CheckoutPage />);

        expect(
            consoleErrorSpy
        ).toHaveBeenCalledWith(
            "Auction ID not found"
        );
    });

    it("handles missing auction or book data", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        window.history.replaceState(
            {
                orderType: "auction",
                auctionId: "auction123",
            },
            "",
            "/checkout"
        );

        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValue(
                createResponse({
                    data: {
                        auction: null,
                        book: null,
                    },
                })
            );

        globalThis.fetch = fetchMock;

        render(<CheckoutPage />);

        await waitFor(() => {
            expect(
                consoleErrorSpy
            ).toHaveBeenCalledWith(
                "Auction details API failed:",
                expect.any(Error)
            );
        });
    });

    it("handles auction payment success", async () => {
        window.history.replaceState(
            {
                orderType: "auction",
                auctionId: "auction123",
                userId: "auction-user",
            },
            "",
            "/checkout"
        );

        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValue(
                createResponse({
                    data: {
                        auction: {
                            currentBidPrice: 3656,
                        },
                        book: {
                            _id: "book123",
                        },
                    },
                })
            );

        globalThis.fetch = fetchMock;

        vi.stubEnv(
            "VITE_PAYMENT_WIDGET_URL",
            "https://example.com/payment.js"
        );

        render(<CheckoutPage />);

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                "https://example.com/api/auction/auction123/bids",
                expect.objectContaining({
                    method: "GET",
                    credentials: "include",
                })
            );
        });

        await waitFor(() => {
            expect(
                document
                    .getElementById(
                        "test-widget-container"
                    )
                    ?.getAttribute("data-price")
            ).toBe("3888.8");
        });

        const successEvent = new CustomEvent(
            "payment-widget-success",
            {
                detail: {
                    paymentMethod: "CARD",
                    transactionId: "auction-txn",
                    paymentStatus: "SUCCESS",
                },
            }
        );

        window.dispatchEvent(successEvent);

        await waitFor(() => {
            expect(
                placeOrderMock
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: "user123",
                    orderType: "auction",
                    auctionId: "auction123",
                    items: [
                        {
                            bookId: "book123",
                            quantity: 1,
                        },
                    ],
                    payment: {
                        paymentMethod: "CARD",
                        transactionId: "auction-txn",
                        paymentStatus: "SUCCESS",
                    },
                    amount: expect.objectContaining({
                        itemAmount: 3656,
                        rentalAmount: 0,
                        securityDeposit: 0,
                        deliveryFee: 50,
                        discount: 0,
                        tax: 182.8,
                        totalAmount: 3888.8,
                    }),
                }),
                expect.objectContaining({
                    onSuccess: expect.any(Function),
                    onError: expect.any(Function),
                })
            );
        });

        const firstCall =
            placeOrderMock.mock.calls[0];

        const callbacks =
            firstCall?.[1] as
                | PlaceOrderOptions
                | undefined;

        callbacks?.onSuccess?.();

        expect(
            clearCartMock
        ).toHaveBeenCalled();

        expect(
            window.location.pathname
        ).toBe("/OrderConform");
    });

    it("does not clear cart when order placement fails", async () => {
        placeOrderMock.mockImplementation(
            (
                _payload: CheckoutRequest,
                options?: PlaceOrderOptions
            ) => {
                options?.onError?.(
                    new Error("Failed")
                );
            }
        );

        render(<CheckoutPage />);

        window.dispatchEvent(
            new CustomEvent(
                "payment-widget-failure",
                {
                    detail: {
                        reason: "declined",
                    },
                }
            )
        );

        await waitFor(() => {
            expect(
                placeOrderMock
            ).toHaveBeenCalled();
        });

        expect(
            clearCartMock
        ).not.toHaveBeenCalled();
    });
});

const actScriptLoad = async (
    script: Element | null
) => {
    if (!script) {
        return;
    }

    await act(async () => {
        script.dispatchEvent(
            new Event("load")
        );
    });
};