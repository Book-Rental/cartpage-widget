import { useEffect } from "react";
import { useCheckout } from "../hooks/CheckoutContext";
import { usePlaceOrder } from "../hooks/usePlaceOrder";
import { useClearCart } from "../hooks/useClearCart";
import { Rb_LoadingSpinner } from "@rentbook/rentbook-ui-lib";


const CheckoutPage: React.FC = () => {
    const paymentWidgetUrl = import.meta.env.VITE_PAYMENT_WIDGET_URL;
    const returnUrl = import.meta.env.VITE_RETURN_URL;

    const { checkoutData, setCheckoutData } = useCheckout();
    const { mutate: clearCart, isPending } = useClearCart();
    const totalAmount = checkoutData.amount?.totalAmount ?? 0;
    const { mutate: placeOrder } = usePlaceOrder();
    // Load Payment Widget
    useEffect(() => {
        if (!paymentWidgetUrl) return;

        const containerId = "test-widget-container";

        const container = document.getElementById(containerId);

        if (!container) return;

        container.setAttribute("data-price", String(totalAmount));
        container.setAttribute("data-merchant-name", "RentBook");
        container.setAttribute("data-currency", "INR");
        container.setAttribute("data-return-url", returnUrl);
        container.setAttribute("data-no-forwarding-path", "true");

        const script = document.createElement("script");
        script.src = paymentWidgetUrl;
        script.async = true;

        script.onload = () => {
            window.renderReactWidget?.(
                JSON.stringify({
                    containerElementId: containerId,
                })
            );
        };

        document.body.appendChild(script);

        return () => {
            window.unmountReactWidget?.(containerId);

            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, [paymentWidgetUrl, returnUrl, totalAmount]);

    // Listen for Payment Success
    useEffect(() => {
        const createOrder = (
            paymentMethod: string,
            transactionId: string,
            paymentStatus: string
        ) => {
            const payment = {
                paymentMethod,
                transactionId,
                paymentStatus,
            };

            const payload = {
                ...checkoutData,
                payment,
            };

            setCheckoutData(payload);

            placeOrder(payload, {
                onSuccess: () => {
                    console.log("Order placed successfully");
                    clearCart();
                    window.history.pushState({}, "", "/OrderConform");
                    window.dispatchEvent(new PopStateEvent("popstate"));
                },
                onError: () => {
                    console.log("Order placement failed");
                },
            });
        };

        const handlePaymentSuccess = (event: Event) => {
            const customEvent = event as CustomEvent;

            const {
                paymentMethod,
                transactionId,
                paymentStatus,
            } = customEvent.detail;

            createOrder(
                paymentMethod,
                transactionId,
                paymentStatus ?? "SUCCESS"
            );
        };

        const handlePaymentFailure = (event: Event) => {
            const customEvent = event as CustomEvent;

            console.log("Payment failed", customEvent.detail);

            createOrder(
                "COD",
                "",
                "FAILED"
            );
        };

        window.addEventListener(
            "payment-widget-success",
            handlePaymentSuccess
        );

        window.addEventListener(
            "payment-widget-failure",
            handlePaymentFailure
        );

        return () => {
            window.removeEventListener(
                "payment-widget-success",
                handlePaymentSuccess
            );

            window.removeEventListener(
                "payment-widget-failure",
                handlePaymentFailure
            );
        };
    }, [checkoutData, setCheckoutData, placeOrder, clearCart]);

    if (isPending) return <><Rb_LoadingSpinner></Rb_LoadingSpinner></>
    return (
        <div
            id="test-widget-container"
            className="mb-6"
        />
    );
};

export default CheckoutPage;