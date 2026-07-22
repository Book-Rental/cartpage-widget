import { useEffect } from "react";

interface CheckoutPageProps {
    totalAmount?: number;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ totalAmount }) => {
    const paymentWidgetUrl = import.meta.env.VITE_PAYMENT_WIDGET_URL;
    const returnUrl = import.meta.env.VITE_RETURN_URL;

    // Load Payment Widget
    useEffect(() => {
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
    }, []);

    return (
        <div
            id="test-widget-container"
            className="mb-6"
        />
    );
};

export default CheckoutPage;