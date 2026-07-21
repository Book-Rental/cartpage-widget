import { useCallback, useState } from "react";
import {
    Rb_Button,
    Rb_Text,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Rb_LoadingSpinner,
} from "@rentbook/rentbook-ui-lib";
import { FaArrowLeft } from "react-icons/fa";

import { CartSummary, InvalidCartItem, Address } from "../types/cart";
import CheckoutPage from "../pages/CheckoutPage";
import AddressSelectionStep from "../pages/AddressSelectionStep";
import Stepper from "../components/Stepper";
import { useValidateCart } from "../hooks/useValidateCart";
import { showToast } from "../utils/ToastFunction";
import ReviewStep from "./ReviewStep";

interface Props {
    summary: CartSummary;
    itemCount: number;
    onValidationResult?: (invalidItems: InvalidCartItem[]) => void;
}

type CheckoutStep = "validation" | "address" | "review" | "payment";

const STEPS = [
    { key: "validation", label: "Validation" },
    { key: "address", label: "Address" },
    { key: "review", label: "Review" },
    { key: "payment", label: "Payment" },
];

export default function OrderSummary({
    summary,
    itemCount,
    onValidationResult,
}: Props) {
    const hasItems = itemCount > 0;

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [step, setStep] = useState<CheckoutStep>("validation");
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

    const { mutate: validateCart, isPending } = useValidateCart();

    const runValidation = useCallback(() => {
        setStep("validation");
        validateCart(undefined, {
            onSuccess: ({ isValid, invalidItems }) => {
                onValidationResult?.(invalidItems);

                if (isValid) {
                    setStep("address");
                } else {
                    showToast("Some items in your cart are invalid", "error");
                }
            },
            onError: () => {
                showToast("Failed to validate cart", "error");
            },
        });
    }, [validateCart, onValidationResult]);

    const handleOpenCheckout = () => {
        setIsCheckoutOpen(true);
        runValidation();
    };

    const handleCloseCheckout = () => {
        setIsCheckoutOpen(false);
        setStep("validation");
        setSelectedAddress(null);
    };

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
                        <Rb_Text>₹{hasItems ? summary.deliveryFee : 0}</Rb_Text>
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
                    disabled={isPending || !hasItems}
                >
                    {isPending ? "Validating..." : "Proceed to Checkout"}
                </Rb_Button>
            </div>

            <Modal
                isOpen={isCheckoutOpen}
                onClose={handleCloseCheckout}
                className="flex max-h-[95vh] w-[95vw] max-w-[880px] flex-col sm:w-[90vw]"
            >
                <ModalHeader onClose={handleCloseCheckout}>
                    {step === "payment" ? "Checkout" : "Checkout Progress"}
                </ModalHeader>

                <div className="px-4">
                    <Stepper steps={STEPS} currentStep={step} />
                </div>

                {step === "validation" && (
                    <>
                        <ModalBody className="flex-1 min-h-0 flex items-center justify-center">
                            {isPending ? (
                                <Rb_LoadingSpinner text="Validating your cart..." />
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <Rb_Text className="text-red-500">
                                        Validation failed. Please retry.
                                    </Rb_Text>
                                    <Rb_Button onClick={runValidation}>
                                        Retry Validation
                                    </Rb_Button>
                                </div>
                            )}
                        </ModalBody>

                        <ModalFooter>
                            <Rb_Button variant="secondary" onClick={handleCloseCheckout}>
                                Cancel
                            </Rb_Button>
                        </ModalFooter>
                    </>
                )}

                {step === "address" && (
                    <>
                        <ModalBody className="flex-1 min-h-0">
                            <AddressSelectionStep onAddressSelected={setSelectedAddress} />
                        </ModalBody>

                        <ModalFooter>
                            <Rb_Button variant="secondary" onClick={handleCloseCheckout}>
                                Cancel
                            </Rb_Button>
                            <Rb_Button
                                disabled={!selectedAddress}
                                onClick={() => setStep("review")}
                            >
                                Continue to Review
                            </Rb_Button>
                        </ModalFooter>
                    </>
                )}

                {step === "review" && (
                    <>
                        <ModalBody className="flex-1 min-h-0">
                            <Rb_Button
                                variant="outline"
                                size="sm"
                                leftIcon={<FaArrowLeft />}
                                onClick={() => setStep("address")}
                                className="mb-4"
                            >
                                Back to Address
                            </Rb_Button>

                            <ReviewStep summary={summary} address={selectedAddress} />
                        </ModalBody>

                        <ModalFooter>
                            <Rb_Button variant="secondary" onClick={handleCloseCheckout}>
                                Cancel
                            </Rb_Button>
                            <Rb_Button onClick={() => setStep("payment")}>
                                Continue to Payment
                            </Rb_Button>
                        </ModalFooter>
                    </>
                )}

                {step === "payment" && (
                    <ModalBody className="flex-1 min-h-0">
                        <Rb_Button
                            variant="outline"
                            size="sm"
                            leftIcon={<FaArrowLeft />}
                            onClick={() => setStep("review")}
                            className="mb-4"
                        >
                            Back to Review
                        </Rb_Button>

                        <CheckoutPage totalAmount={summary.total} />
                    </ModalBody>
                )}
            </Modal>
        </>
    );
}