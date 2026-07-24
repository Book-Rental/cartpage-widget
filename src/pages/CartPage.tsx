import { useEffect, useState } from "react";
import {
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Rb_Button,
    Rb_LoadingSpinner,
} from "@rentbook/rentbook-ui-lib";

import CartItem from "../components/CartItem";
import OrderSummary from "../components/OrderSummary";
import { useCart } from "../hooks/useCart";
import { useClearCart } from "../hooks/useClearCart";
import { showToast } from "../utils/ToastFunction";
import { useValidateCart } from "../hooks/useValidateCart";
import { InvalidCartItem } from "../types/cart";
export default function CartPage() {
    const { data, isLoading, isError } = useCart();
    const { mutate: clearCart, isPending } = useClearCart();
    const [isClearModalOpen, setClearModalOpen] = useState(false);


    const [invalidItems, setInvalidItems] = useState<InvalidCartItem[]>([]);
    const [showValidationModal, setShowValidationModal] = useState(false);

    const { mutate: validateCart } = useValidateCart();

    useEffect(() => {
        const event = new CustomEvent("widget-loading-status", {
            detail: isLoading
        });
        window.dispatchEvent(event);
    }, [isLoading]);

    if (isLoading) {
        return <Rb_LoadingSpinner text="Loading cart details..." />;
    }

    if (isError || !data) {
        return <div>Failed to load cart.</div>;
    }

    const handleBrowseBooks = () => {
        window.history.pushState({}, "", "/books");
        window.dispatchEvent(new PopStateEvent("popstate"));
    };

    const handleClearCart = () => {
        clearCart(undefined, {
            onSuccess: () => {
                setClearModalOpen(false);
                showToast("Cart cleared successfully");
            },
            onError: () => {
                showToast("Failed to clear cart", "error");
            },
        });
    };
    const handleCheckout = () => {
        validateCart(undefined, {
            onSuccess: ({ isValid, invalidItems }) => {
                if (isValid) {
                    window.history.pushState({}, "", "/checkout");
                    window.dispatchEvent(new PopStateEvent("popstate"));
                } else {
                    setInvalidItems(invalidItems);
                    setShowValidationModal(true);
                }
            },
            onError: () => {
                showToast("Failed to validate cart", "error");
            },
        });
    };
    const clearItemError = (bookId: string) => {
        setInvalidItems((prev) =>
            prev.filter((item) => item.bookId !== bookId)
        );

        validateCart(undefined, {
            onSuccess: ({ invalidItems }) => {
                setInvalidItems(invalidItems);
            },
            onError: () => {
                showToast("Failed to validate cart", "error");
            },
        });
    };

    return (
        <div className=" w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[3fr_1.1fr]">
                <div>
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h1 className="text-2xl font-semibold">
                                Your Cart ({data.items.length}{" "}
                                {data.items.length === 1 ? "Item" : "Items"})
                            </h1>

                            <Rb_Button
                                variant="outline"
                                onClick={() => setClearModalOpen(true)}
                                disabled={isPending || data.items.length === 0}
                            >
                                Clear Cart
                            </Rb_Button>
                        </div>

                        {data.items.length === 0 ? (
                            <div className="flex flex-col items-center gap-4 py-10">
                                <p className="text-gray-500">Your cart is empty.</p>
                                <Rb_Button onClick={handleBrowseBooks}>
                                    Browse Books
                                </Rb_Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {data.items.map((item) => {
                                    const invalid = invalidItems.find(
                                        (i) => i.bookId === item.bookId._id
                                    );

                                    return (
                                        <CartItem
                                            key={item.bookId._id}
                                            item={item}
                                            errorMessage={invalid?.reason}
                                            onValidationSuccess={() => clearItemError(item.bookId._id)}

                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:sticky lg:top-6">
                    <OrderSummary
                        summary={data.summary}
                        itemCount={data.items.length}
                        onCheckout={handleCheckout}
                    />
                </div>
            </div>

            <Modal
                isOpen={isClearModalOpen}
                onClose={() => setClearModalOpen(false)}
            >
                <ModalHeader onClose={() => setClearModalOpen(false)}>
                    Clear Cart
                </ModalHeader>

                <ModalBody>
                    Are you sure you want to remove all books from your cart?
                </ModalBody>

                <ModalFooter>
                    <Rb_Button
                        variant="secondary"
                        onClick={() => setClearModalOpen(false)}
                    >
                        Cancel
                    </Rb_Button>

                    <Rb_Button
                        className="!bg-red-500"
                        disabled={isPending}
                        onClick={handleClearCart}
                    >
                        Clear Cart
                    </Rb_Button>
                </ModalFooter>
            </Modal>

            <Modal
                isOpen={showValidationModal}
                onClose={() => setShowValidationModal(false)}
            >
                <ModalHeader
                    onClose={() => setShowValidationModal(false)}
                >
                    Cart Validation Failed
                </ModalHeader>

                <ModalBody>
                    Some items in your cart are unavailable.
                </ModalBody>

                <ModalFooter>
                    <Rb_Button
                        onClick={() => setShowValidationModal(false)}
                    >
                        OK
                    </Rb_Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}