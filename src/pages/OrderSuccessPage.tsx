import { FaCheckCircle } from "react-icons/fa";
import { Rb_Button, Rb_Text } from "@rentbook/rentbook-ui-lib";
import { useEffect } from "react";

const OrderSuccessPage = () => {
    const handleContinueShopping = () => {
        window.history.pushState({}, "", "/books");
        window.dispatchEvent(new PopStateEvent("popstate"));
    };
    useEffect(() => {
        const event = new CustomEvent("widget-loading-status", {
            detail: false
        });
        window.dispatchEvent(event);
    }, [])
    const handleViewOrders = () => {
        window.history.pushState({}, "", "/orders");
        window.dispatchEvent(new PopStateEvent("popstate"));
    };
    useEffect(() => {

    }, [])
    return (
        <div className="flex items-center justify-center min-h-[70vh] px-4">
            <div className="max-w-lg w-full bg-white rounded-xl shadow-md p-8 text-center">

                <FaCheckCircle
                    className="mx-auto text-green-500 mb-4"
                    size={72}
                />

                <h1 className="text-3xl font-bold mb-3">
                    Payment Successful!
                </h1>

                <Rb_Text className="text-gray-600 mb-6">
                    Thank you for your order. Your books have been successfully
                    reserved and your payment has been received.
                </Rb_Text>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <Rb_Text className="font-medium">
                        Your order has been placed successfully.
                    </Rb_Text>

                    <Rb_Text className="text-sm text-gray-500 mt-2">
                        You will receive an email/SMS confirmation shortly.
                    </Rb_Text>
                </div>

                <div className="flex gap-4 justify-center">
                    <Rb_Button
                        variant="secondary"
                        onClick={handleViewOrders}
                    >
                        View Orders
                    </Rb_Button>

                    <Rb_Button
                        onClick={handleContinueShopping}
                    >
                        Continue Shopping
                    </Rb_Button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;