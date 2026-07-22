import { useCallback, useEffect, useState } from "react";
import { Rb_Button, Rb_LoadingSpinner, Rb_Text } from "@rentbook/rentbook-ui-lib";
import { FaArrowLeft } from "react-icons/fa";

import { useCart } from "../hooks/useCart";
import { useValidateCart } from "../hooks/useValidateCart";
import { Address, InvalidCartItem } from "../types/cart";
import Stepper from "../components/Stepper";
import AddressSelectionStep from "./AddressSelectionStep";
import PaymentWidgetPage from "./CheckoutPage";
import { showToast } from "../utils/ToastFunction";
import ReviewStep from "../components/ReviewStep";

type CheckoutStep = "validation" | "address" | "review" | "payment";

const STEPS = [
    { key: "validation", label: "Validation" },
    { key: "address", label: "Address" },
    { key: "review", label: "Review" },
    { key: "payment", label: "Payment" },
];

function navigateTo(path: string) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function CheckoutFlowPage() {
    const { data, isLoading: isCartLoading } = useCart();
    const [step, setStep] = useState<CheckoutStep>("validation");
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [invalidItems, setInvalidItems] = useState<InvalidCartItem[]>([]);

    const { mutate: validateCart, isPending } = useValidateCart();

    const runValidation = useCallback(() => {
        setStep("validation");
        validateCart(undefined, {
            onSuccess: ({ isValid, invalidItems }) => {
                setInvalidItems(invalidItems);

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
    }, [validateCart]);

    useEffect(() => {
        runValidation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleBackToCart = () => navigateTo("/");

    if (isCartLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Rb_LoadingSpinner text="Loading checkout..." />
            </div>
        );
    }

    // Map invalid bookIds -> book name, using data already fetched from useCart
    const invalidItemDetails = invalidItems.map((invalid) => {
        const cartItem = data?.items.find((i) => i.bookId._id === invalid.bookId);
        return {
            bookId: invalid.bookId,
            reason: invalid.reason,
            name: cartItem?.bookId.name ?? "Unknown item",
        };
    });

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <Rb_Text
                variant="h2"
                className="mb-4 text-xl font-semibold sm:mb-6 sm:text-2xl"
            >
                Checkout
            </Rb_Text>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
                <Stepper steps={STEPS} currentStep={step} />

                <div className="mt-6 sm:mt-8">
                    {step === "validation" && (
                        <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 py-6 text-center sm:min-h-[320px]">
                            {isPending ? (
                                <Rb_LoadingSpinner text="Validating your cart..." />
                            ) : (
                                <>
                                    <Rb_Text className="text-base font-medium text-red-500">
                                        Validation failed. Please retry.
                                    </Rb_Text>

                                    {invalidItemDetails.length > 0 && (
                                        <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-4 text-left">
                                            <Rb_Text className="mb-2 text-sm font-semibold text-red-600">
                                                {invalidItemDetails.length} item(s) unavailable:
                                            </Rb_Text>
                                            <ul className="space-y-1.5">
                                                {invalidItemDetails.map((item) => (
                                                    <li
                                                        key={item.bookId}
                                                        className="text-sm leading-snug text-red-600"
                                                    >
                                                        <span className="font-medium">{item.name}</span>
                                                        {" — "}
                                                        {item.reason}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="mt-2 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
                                        <Rb_Button className="w-full sm:w-auto" onClick={runValidation}>
                                            Retry Validation
                                        </Rb_Button>
                                        <Rb_Button
                                            variant="secondary"
                                            className="w-full sm:w-auto"
                                            onClick={handleBackToCart}
                                        >
                                            Back to Cart
                                        </Rb_Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {step === "address" && (
                        <>
                            <AddressSelectionStep onAddressSelected={setSelectedAddress} />

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <Rb_Button
                                    variant="secondary"
                                    className="w-full sm:w-auto"
                                    onClick={handleBackToCart}
                                >
                                    Cancel
                                </Rb_Button>
                                <Rb_Button
                                    className="w-full sm:w-auto"
                                    disabled={!selectedAddress}
                                    onClick={() => setStep("review")}
                                >
                                    Continue to Review
                                </Rb_Button>
                            </div>
                        </>
                    )}

                    {step === "review" && data && (
                        <>
                            <Rb_Button
                                variant="outline"
                                size="sm"
                                leftIcon={<FaArrowLeft />}
                                onClick={() => setStep("address")}
                                className="mb-4"
                            >
                                Back to Address
                            </Rb_Button>

                            <ReviewStep summary={data.summary} address={selectedAddress} />

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <Rb_Button
                                    variant="secondary"
                                    className="w-full sm:w-auto"
                                    onClick={handleBackToCart}
                                >
                                    Cancel
                                </Rb_Button>
                                <Rb_Button
                                    className="w-full sm:w-auto"
                                    onClick={() => setStep("payment")}
                                >
                                    Continue to Payment
                                </Rb_Button>
                            </div>
                        </>
                    )}

                    {step === "payment" && data && (
                        <>
                            <Rb_Button
                                variant="outline"
                                size="sm"
                                leftIcon={<FaArrowLeft />}
                                onClick={() => setStep("review")}
                                className="mb-4"
                            >
                                Back to Review
                            </Rb_Button>

                            <PaymentWidgetPage totalAmount={data.summary.total} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}