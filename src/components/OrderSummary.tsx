import { Rb_Button, Rb_Text } from "@rentbook/rentbook-ui-lib";
import { CartSummary } from "../types/cart";

interface Props {
    summary: CartSummary;
    itemCount: number;
    onCheckout: () => void;
}
export default function OrderSummary({
    summary,
    itemCount,
    onCheckout,
}: Props) {
    const hasItems = itemCount > 0;


    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
            <Rb_Text
                variant="h2"
                className="mb-6 text-xl font-semibold sm:text-2xl"
            >
                Order Summary
            </Rb_Text>

            {!hasItems ? (
                <div className="py-10 text-center">
                    <Rb_Text className="text-3xl font-medium text-gray-600">
                        Add books to your cart to view the order summary.
                    </Rb_Text>
                </div>
            ) : (
                <>
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <Rb_Text>
                                Rental Charges ({itemCount}{" "}
                                {itemCount === 1 ? "Book" : "Books"})
                            </Rb_Text>
                            <Rb_Text>₹{summary.subtotal}</Rb_Text>
                        </div>

                        <div className="flex items-center justify-between">
                            <Rb_Text>Security Deposit</Rb_Text>
                            <Rb_Text>₹{summary.securityDepositTotal}</Rb_Text>
                        </div>

                        <div className="flex items-center justify-between">
                            <Rb_Text>Delivery Charges</Rb_Text>
                            <Rb_Text>₹{summary.deliveryFee}</Rb_Text>
                        </div>

                        <div className="flex items-center justify-between">
                            <Rb_Text>Tax</Rb_Text>
                            <Rb_Text>₹{summary.tax.toFixed(2)}</Rb_Text>
                        </div>
                    </div>

                    <div className="my-6 border-t pt-6">
                        <div className="flex items-center justify-between">
                            <Rb_Text variant="h4" className="font-bold">
                                Total Amount
                            </Rb_Text>
                            <Rb_Text variant="h4" className="font-bold">
                                ₹{summary.total}
                            </Rb_Text>
                        </div>
                    </div>

                    <Rb_Button
                        className="mt-2 w-full"
                        onClick={onCheckout}
                    >
                        Proceed to Checkout
                    </Rb_Button>
                </>
            )}
        </div>
    );
}