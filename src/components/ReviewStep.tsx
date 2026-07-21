import { Rb_Text } from "@rentbook/rentbook-ui-lib";
import { CartSummary, Address } from "../types/cart";

interface Props {
    summary: CartSummary;
    address: Address | null;
}

export default function ReviewStep({ summary, address }: Props) {
    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 p-4">
                <Rb_Text variant="h4" className="mb-2 font-semibold">
                    Delivery Address
                </Rb_Text>

                {address ? (
                    <div className="space-y-1">
                        <Rb_Text className="font-medium">
                            {address.name}
                        </Rb_Text>

                        <Rb_Text className="text-sm text-gray-600">
                            {address.street}
                        </Rb_Text>

                        <Rb_Text className="text-sm text-gray-600">
                            {address.city}, {address.state} - {address.zipCode}
                        </Rb_Text>

                        <Rb_Text className="text-sm text-gray-600">
                            {address.country}
                        </Rb_Text>

                        <Rb_Text className="text-sm text-gray-600">
                            Phone: {address.phone}
                        </Rb_Text>

                        <Rb_Text className="text-xs text-gray-500 capitalize">
                            {address.type} Address
                        </Rb_Text>
                    </div>
                ) : (
                    <Rb_Text className="text-sm text-red-500">
                        No address selected
                    </Rb_Text>
                )}
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
                <Rb_Text variant="h4" className="mb-3 font-semibold">
                    Order Summary
                </Rb_Text>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{summary.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Security Deposit</span>
                        <span>₹{summary.securityDepositTotal}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Delivery Charges</span>
                        <span>₹{summary.deliveryFee}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax</span>
                        <span>₹{summary.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-bold">
                        <span>Total</span>
                        <span>₹{summary.total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}