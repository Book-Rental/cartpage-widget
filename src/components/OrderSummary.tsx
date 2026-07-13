import { Rb_Button, Rb_Text } from "@rentbook/rentbook-ui-lib";
import { CartSummary } from "../types/cart";

interface Props {
    summary: CartSummary;
    itemCount: number;
}

export default function OrderSummary({
    summary,
    itemCount,
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

            <div className="space-y-5">

                <div className="flex items-center justify-between">
                    <Rb_Text>
                        Rental Charges ({itemCount} {itemCount === 1 ? "Book" : "Books"})
                    </Rb_Text>

                    <Rb_Text>
                        ₹{summary.subtotal}
                    </Rb_Text>
                </div>

                <div className="flex items-center justify-between">
                    <Rb_Text>
                        Security Deposit
                    </Rb_Text>

                    <Rb_Text>
                        ₹{summary.securityDepositTotal}
                    </Rb_Text>
                </div>

                <div className="flex items-center justify-between">
                    <Rb_Text>
                        Delivery Charges
                    </Rb_Text>

                    <Rb_Text>
                        ₹{hasItems ? summary.deliveryFee : 0}
                    </Rb_Text>
                </div>

                <div className="flex items-center justify-between">
                    <Rb_Text>
                        Tax
                    </Rb_Text>

                    <Rb_Text>
                        ₹{summary.tax}
                    </Rb_Text>
                </div>

            </div>

            <div className="my-6 border-t pt-6">
                <div className="flex items-center justify-between">

                    <Rb_Text variant="h4" className="font-bold">
                        Total Amount
                    </Rb_Text>

                    <Rb_Text variant="h4" className="font-bold">
                        ₹{hasItems ? summary.total : 0}
                    </Rb_Text>

                </div>
            </div>

            <Rb_Button className="mt-2 w-full">
                Proceed to Checkout
            </Rb_Button>
        </div>
    );
}