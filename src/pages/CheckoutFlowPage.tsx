
import { useCallback, useEffect, useState } from "react";
import {
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Rb_Button,
    Rb_LoadingSpinner,
    Rb_Text,
} from "@rentbook/rentbook-ui-lib";
import { FaArrowLeft } from "react-icons/fa";

import { useCart } from "../hooks/useCart";
import { useValidateCart } from "../hooks/useValidateCart";
import { InvalidCartItem } from "../types/cart";

import Stepper from "../components/Stepper";
import AddressSelectionStep from "./AddressSelectionStep";
import ReviewStep from "../components/ReviewStep";
import PaymentWidgetPage from "./CheckoutPage";

import { showToast } from "../utils/ToastFunction";
import { useCheckout } from "../hooks/CheckoutContext";

const STEPS = [
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

    const {
        step,
        setStep,
        checkoutData,
        setCheckoutData,
    } = useCheckout();

    const [isAddressValid, setIsAddressValid] = useState(false);
    const [invalidItems, setInvalidItems] = useState<InvalidCartItem[]>([]);

    const [isAuctionLoading, setIsAuctionLoading] = useState(false);

    const { mutate: validateCart } = useValidateCart();

    const [isValidationModalOpen, setValidationModalOpen] =
        useState(false);

    const historyState = window.history.state;

    const isAuctionCheckout =
        historyState?.orderType === "auction";

    const auctionId = historyState?.auctionId;
    const auctionBookId = historyState?.bookId;

    useEffect(() => {
        if (!data || isAuctionCheckout) return;

        setCheckoutData((prev) => ({
            ...prev,
            userId: data.userId,
            orderType: "rent",
            items: data.items.map((item) => ({
                bookId: item.bookId._id,
                quantity: item.quantity,
                rentalType: item.rentalPeriod,
            })),
            amount: {
                rentalAmount: data.summary.subtotal,
                securityDeposit: data.summary.securityDepositTotal,
                deliveryFee: data.summary.deliveryFee,
                discount: 0,
                tax: data.summary.tax,
                totalAmount: data.summary.total,
            },
        }));
    }, [
        data,
        isAuctionCheckout,
        setCheckoutData,
    ]);

    useEffect(() => {
        if (!isAuctionCheckout || !auctionId) {
            return;
        }

        const loadAuctionCheckout = async () => {
            try {
                setIsAuctionLoading(true);

                const API_URL = import.meta.env.VITE_API_BASE_URL;

                const response = await fetch(
                    `${API_URL}/auction/${auctionId}/bids`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch auction details"
                    );
                }

                const result = await response.json();

                console.log(
                    "Auction checkout response:",
                    result
                );

                // API response:
                // result.data.auction.currentBidPrice
                const auction =
                    result?.data?.auction ??
                    result?.auction ??
                    result;

                const currentBidPrice = Number(
                    auction?.currentBidPrice ?? 0
                );

                // Auction amount details
                const deliveryFee = 49;
                const discount = 0;
                const rentalAmount = 0;
                const securityDeposit = 0;
                const tax = 0;

                // Auction total = bid price + delivery fee - discount
                const totalAmount =
                    currentBidPrice +
                    deliveryFee -
                    discount;

                const userId =
                    historyState?.userId ||
                    window.HOST_USER_INFO?._id ||
                    "";

                const auctionCheckoutData = {
                    userId,

                    orderType: "auction" as const,

                    items: [
                        {
                            bookId: auctionBookId,
                            quantity: 1,
                        },
                    ],

                    amount: {
                        itemAmount: currentBidPrice,
                        rentalAmount,
                        securityDeposit,
                        deliveryFee,
                        discount,
                        tax,
                        totalAmount,
                    },
                };

                setCheckoutData((prev) => ({
                    ...prev,
                    ...auctionCheckoutData,
                }));

                console.log(
                    "Auction checkout amount:",
                    auctionCheckoutData.amount
                );
            } catch (error) {
                console.error(
                    "Auction checkout error:",
                    error
                );

                showToast(
                    error instanceof Error
                        ? error.message
                        : "Failed to load auction details.",
                    "error"
                );
            } finally {
                setIsAuctionLoading(false);
            }
        };

        loadAuctionCheckout();
    }, [
        isAuctionCheckout,
        auctionId,
        auctionBookId,
        setCheckoutData,
    ]);

    const runValidation = useCallback(() => {
        validateCart(undefined, {
            onSuccess: ({ isValid, invalidItems }) => {
                setInvalidItems(invalidItems);

                if (isValid) {
                    setStep("address");
                } else {
                    setValidationModalOpen(true);
                }
            },
            onError: () => {
                showToast(
                    "Failed to validate cart",
                    "error"
                );
            },
        });
    }, [validateCart, setStep]);

    useEffect(() => {
        if (isAuctionCheckout) {
            setStep("address");
            return;
        }

        runValidation();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuctionCheckout]);

    const handleBackToCart = () => {
    if (isAuctionCheckout) {
        navigateTo("/my-bids?tab=won");
        return;
    }

    navigateTo("/cart");
};

    if (
        isCartLoading &&
        !isAuctionCheckout
    ) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Rb_LoadingSpinner text="Loading checkout..." />
            </div>
        );
    }

    if (
        isAuctionCheckout &&
        (isAuctionLoading || !checkoutData.amount)
    ) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Rb_LoadingSpinner text="Loading auction checkout..." />
            </div>
        );
    }

    const invalidItemDetails = invalidItems.map(
        (invalid) => {
            const cartItem = data?.items.find(
                (item) =>
                    item.bookId._id === invalid.bookId
            );

            return {
                bookId: invalid.bookId,
                reason: invalid.reason,
                name:
                    cartItem?.bookId.name ??
                    "Unknown item",
            };
        }
    );

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <Rb_Text
                variant="h2"
                className="mb-4 text-xl font-semibold sm:mb-6 sm:text-2xl"
            >
                Checkout
            </Rb_Text>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
                <Stepper
                    steps={STEPS}
                    currentStep={step}
                />

                <div className="mt-6 sm:mt-8">

                    {/* ADDRESS */}
                    {step === "address" && (
                        <>
                            <AddressSelectionStep
                                onAddressValidationChange={
                                    setIsAddressValid
                                }
                            />

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <Rb_Button
                                    variant="secondary"
                                    className="w-full sm:w-auto"
                                    onClick={
                                        handleBackToCart
                                    }
                                >
                                    Cancel
                                </Rb_Button>

                                <Rb_Button
                                    className="w-full sm:w-auto"
                                    disabled={
                                        !checkoutData.shippingAddress ||
                                        !isAddressValid
                                    }
                                    onClick={() =>
                                        setStep("review")
                                    }
                                >
                                    Continue to Review
                                </Rb_Button>
                            </div>
                        </>
                    )}

                    {/* REVIEW */}
                    {step === "review" &&
                        checkoutData.amount && (
                            <>
                                <Rb_Button
                                    variant="outline"
                                    size="sm"
                                    leftIcon={
                                        <FaArrowLeft />
                                    }
                                    onClick={() =>
                                        setStep("address")
                                    }
                                    className="mb-4"
                                >
                                    Back to Address
                                </Rb_Button>

                                <ReviewStep />

                                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <Rb_Button
                                        variant="secondary"
                                        className="w-full sm:w-auto"
                                        onClick={
                                            handleBackToCart
                                        }
                                    >
                                        Cancel
                                    </Rb_Button>

                                    <Rb_Button
                                        className="w-full sm:w-auto"
                                        onClick={() =>
                                            setStep("payment")
                                        }
                                    >
                                        Continue to Payment
                                    </Rb_Button>
                                </div>
                            </>
                        )}

                    {/* PAYMENT */}
                    {step === "payment" &&
                        checkoutData.amount && (
                            <>
                                <Rb_Button
                                    variant="outline"
                                    size="sm"
                                    leftIcon={
                                        <FaArrowLeft />
                                    }
                                    onClick={() =>
                                        setStep("review")
                                    }
                                    className="mb-4"
                                >
                                    Back to Review
                                </Rb_Button>

                                <PaymentWidgetPage />
                            </>
                        )}
                </div>
            </div>

            {/* RENT CART VALIDATION MODAL */}
            <Modal
                isOpen={
                    isValidationModalOpen &&
                    !isAuctionCheckout
                }
                onClose={() =>
                    setValidationModalOpen(false)
                }
            >
                <ModalHeader
                    onClose={() =>
                        setValidationModalOpen(false)
                    }
                >
                    Cart Validation Failed
                </ModalHeader>

                <ModalBody>
                    <Rb_Text className="mb-4 font-medium text-red-500">
                        Some items in your cart are unavailable.
                    </Rb_Text>

                    <ul className="space-y-2">
                        {invalidItemDetails.map(
                            (item) => (
                                <li key={item.bookId}>
                                    <strong>
                                        {item.name}
                                    </strong>{" "}
                                    — {item.reason}
                                </li>
                            )
                        )}
                    </ul>
                </ModalBody>

                <ModalFooter>
                    <Rb_Button
                        variant="secondary"
                        onClick={() => {
                            setValidationModalOpen(
                                false
                            );
                            handleBackToCart();
                        }}
                    >
                        Back to Cart
                    </Rb_Button>

                    <Rb_Button
                        onClick={() => {
                            setValidationModalOpen(
                                false
                            );
                            runValidation();
                        }}
                    >
                        Retry
                    </Rb_Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}
