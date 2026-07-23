import { Rb_Text } from "@rentbook/rentbook-ui-lib";
import { useCheckout } from "../hooks/CheckoutContext";

export default function ReviewStep() {
    const { checkoutData } = useCheckout();

    const { shippingAddress, amount } = checkoutData;

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 p-4">
                <Rb_Text
                    variant="h4"
                    className="mb-2 font-semibold"
                >
                    Delivery Address
                </Rb_Text>

                {shippingAddress ? (
                    <div className="space-y-1">
                        <Rb_Text className="font-medium">
                            {shippingAddress.name}
                        </Rb_Text>

                        <Rb_Text className="text-sm text-gray-600">
                            {shippingAddress.addressLine1}
                        </Rb_Text>

                        {shippingAddress.addressLine2 && (
                            <Rb_Text className="text-sm text-gray-600">
                                {shippingAddress.addressLine2}
                            </Rb_Text>
                        )}

                        {shippingAddress.landmark && (
                            <Rb_Text className="text-sm text-gray-600">
                                Landmark: {shippingAddress.landmark}
                            </Rb_Text>
                        )}

                        <Rb_Text className="text-sm text-gray-600">
                            {shippingAddress.city},{" "}
                            {shippingAddress.state} -{" "}
                            {shippingAddress.pincode}
                        </Rb_Text>

                        <Rb_Text className="text-sm text-gray-600">
                            {shippingAddress.country}
                        </Rb_Text>

                        <Rb_Text className="text-sm text-gray-600">
                            Phone: {shippingAddress.phone}
                        </Rb_Text>

                        <Rb_Text className="text-xs text-gray-500 capitalize">
                            {shippingAddress.type} Address
                        </Rb_Text>
                    </div>
                ) : (
                    <Rb_Text className="text-sm text-red-500">
                        No address selected
                    </Rb_Text>
                )}
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
                <Rb_Text
                    variant="h4"
                    className="mb-3 font-semibold"
                >
                    Order Summary
                </Rb_Text>

                {amount && (
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Rental Amount</span>
                            <span>₹{amount.rentalAmount}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Security Deposit</span>
                            <span>₹{amount.securityDeposit}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Delivery Charges</span>
                            <span>₹{amount.deliveryFee}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Discount</span>
                            <span>₹{amount.discount}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Tax</span>
                            <span>₹{amount.tax.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between border-t pt-2 font-bold">
                            <span>Total</span>
                            <span>₹{amount.totalAmount}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}