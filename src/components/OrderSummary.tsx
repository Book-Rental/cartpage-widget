import { useState } from "react";
import {
    Rb_Button,
    Rb_Text,
    Modal,
    ModalHeader,
    ModalBody,
} from "@rentbook/rentbook-ui-lib";

import { CartSummary } from "../types/cart";
import CheckoutPage from "../pages/CheckoutPage";

interface Props {
    summary: CartSummary;
    itemCount: number;
}

export default function OrderSummary({
    summary,
    itemCount,
}: Props) {
    const hasItems = itemCount > 0;
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const handleOpenCheckout = () => setIsCheckoutOpen(true);
    const handleCloseCheckout = () => setIsCheckoutOpen(false);

    return (
        <>
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

                        <Rb_Text>
                            ₹{hasItems ? summary.deliveryFee : 0}
                        </Rb_Text>
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
                            ₹{hasItems ? summary.total : 0}
                        </Rb_Text>
                    </div>
                </div>

                <Rb_Button
                    className="mt-2 w-full"
                    onClick={handleOpenCheckout}
                >
                    Proceed to Checkout
                </Rb_Button>
            </div>

            <Modal
                isOpen={isCheckoutOpen}
                onClose={handleCloseCheckout}
                className="max-h-[95vh] flex flex-col"
            >
                <ModalHeader onClose={handleCloseCheckout}>
                    Checkout
                </ModalHeader>

                <ModalBody className="flex-1 min-h-0 overflow-y-auto p-6">
                    <CheckoutPage totalAmount={summary.total} />
                </ModalBody>
            </Modal>
        </>
    );
}