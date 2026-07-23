import { useEffect } from "react";
import { useCheckout } from "../hooks/CheckoutContext";
import { usePlaceOrder } from "../hooks/usePlaceOrder";

const CheckoutPage: React.FC = () => {
    const paymentWidgetUrl = import.meta.env.VITE_PAYMENT_WIDGET_URL;
    const returnUrl = import.meta.env.VITE_RETURN_URL;

    const { checkoutData, setCheckoutData } = useCheckout();

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
        const handlePaymentSuccess = (event: Event) => {
            const customEvent = event as CustomEvent;

            const {
                status,
                amount,
                currency,
                paymentMethod,
                transactionId,
            } = customEvent.detail;

            console.log("Payment completed successfully!", {
                status,
                amount,
                currency,
                paymentMethod,
                transactionId,
            });
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            const payment = {
                paymentMethod,
                transactionId,
            };

            const payload = {
                ...checkoutData,
                payment,
            };

            setCheckoutData(payload);

            placeOrder(payload, {
                onSuccess: () => {
                    console.log("Order placed successfully");
                },
                onError: () => {
                    console.log("Order placement failed");
                },
            });
        };

        window.addEventListener(
            "payment-widget-success",
            handlePaymentSuccess
        );

        return () => {
            window.removeEventListener(
                "payment-widget-success",
                handlePaymentSuccess
            );
        };
    }, [setCheckoutData]);

    // Debug - Remove this after testing
    useEffect(() => {
        console.log("Checkout Payload", checkoutData);
    }, [checkoutData]);

    return (
        <div
            id="test-widget-container"
            className="mb-6"
        />
    );
};

export default CheckoutPage;