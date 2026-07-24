import { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import {
    Dropdown,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Rb_Button,
    Rb_Icon,
    Rb_Image,
    Rb_Text,
    Rb_Quantity,
} from "@rentbook/rentbook-ui-lib";
import { CartItemType } from "../types/cart";
import { useDeleteCartItem } from "../hooks/useDeleteCartItem";
import { showToast } from "../utils/ToastFunction";
import { useUpdateCartQuantity } from "../hooks/useUpdateCart";
import { useUpdateRentalPeriod } from "../hooks/useUpdateRentalPeriod";

interface Props {
    item: CartItemType;
    errorMessage?: string;
    onValidationSuccess?: () => void;

}

export default function CartItem({ item, errorMessage, onValidationSuccess }: Props) {
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const {
        mutate: updateQuantity,
        isPending: isUpdatingQuantity,
    } = useUpdateCartQuantity();
    const [quantity, setQuantity] = useState(item.quantity);

    const {
        mutate: updateRentalPeriod,
        isPending: isUpdatingRentalPeriod,
    } = useUpdateRentalPeriod();
    const [rentalPeriod, setRentalPeriod] = useState(item.rentalPeriod);

    useEffect(() => {
        setQuantity(item.quantity);
    }, [item.quantity]);

    useEffect(() => {
        setRentalPeriod(item.rentalPeriod);
    }, [item.rentalPeriod]);

    const {
        mutate: deleteItem,
        isPending: isDeletingItem,
    } = useDeleteCartItem();

    const getRentalPrice = () => {
        switch (rentalPeriod) {
            case "day":
                return item.bookId.rentalPricePerDay;
            case "week":
                return item.bookId.rentalPricePerWeek;
            case "month":
                return item.bookId.rentalPricePerMonth;
            default:
                return 0;
        }
    };

    const handleRentalPeriodChange = (newRentalPeriod: string) => {
        const previousRentalPeriod = rentalPeriod;
        setRentalPeriod(newRentalPeriod as CartItemType["rentalPeriod"]);

        updateRentalPeriod(
            {
                bookId: item.bookId._id,
                pricingMode: item.pricingMode,
                currentRentalPeriod: previousRentalPeriod,
                newRentalPeriod,
            },
            {
                onError: () => {
                    setRentalPeriod(previousRentalPeriod);
                    showToast("Failed to update rental period", "error");
                },
            }
        );
    };

    const handleDelete = () => {
        deleteItem(
            {
                bookId: item.bookId._id,
                pricingMode: item.pricingMode,
                rentalPeriod: item.rentalPeriod,
            },
            {
                onSuccess: () => {
                    setDeleteModalOpen(false);
                    showToast(`${item.bookId.name} removed from cart`);
                },
                onError: () => {
                    showToast("Failed to remove book from cart", "error");
                },
            }
        );
    };

    return (
        <>
            <div
                className={`rounded-xl border bg-white p-4 ${errorMessage
                    ? "border-red-300 bg-red-50/40"
                    : "border-gray-200"
                    }`}
            >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_170px_110px_40px] md:items-center">

                    <div className="flex items-center gap-4">
                        <Rb_Image
                            src={item.bookId.coverImage}
                            alt={item.bookId.name}
                            width={100}
                            height={100}
                            className="h-20 w-16 rounded-md object-cover"
                        />
                        <div className="space-y-1">
                            <Rb_Text className="text-base font-semibold text-gray-900">
                                {item.bookId.name}
                            </Rb_Text>

                            <Rb_Text
                                variant="small"
                                className="block text-sm text-gray-500 italic"
                            >
                                By {item.bookId.author}
                            </Rb_Text>


                            <Rb_Quantity
                                value={quantity}
                                min={1}
                                disabled={isUpdatingQuantity}
                                onChange={(value) => {
                                    setQuantity(value);
                                    updateQuantity(
                                        {
                                            bookId: item.bookId._id,
                                            quantity: value,
                                            pricingMode: item.pricingMode,
                                            rentalPeriod: item.rentalPeriod,
                                        },
                                        {
                                            onSuccess: () => {
                                                onValidationSuccess?.();
                                            },
                                            onError: () => {
                                                setQuantity(item.quantity);
                                                showToast("Failed to update quantity", "error");
                                            },
                                        }
                                    );
                                }}
                            />
                            {errorMessage && (
                                <Rb_Text
                                    variant="small"
                                    className="block mt-1 text-sm font-medium text-red-600"
                                >
                                    {errorMessage}
                                </Rb_Text>
                            )}
                        </div>
                    </div>

                    <div>
                        <Rb_Text
                            variant="p"
                            className="mb-2 text-sm text-gray-500"
                        >
                            Duration
                        </Rb_Text>

                        <Dropdown
                            value={rentalPeriod}
                            disabled={isUpdatingRentalPeriod}
                            onChange={handleRentalPeriodChange}
                            options={[
                                { label: "Day", value: "day" },
                                { label: "Week", value: "week" },
                                { label: "Month", value: "month" },
                            ]}
                        />
                    </div>

                    <div className="text-left md:text-right">
                        <Rb_Text className="text-lg font-bold">
                            ₹{getRentalPrice()}
                        </Rb_Text>

                        <Rb_Text
                            variant="small"
                            className="text-gray-400"
                        >
                            ₹{item.bookId.securityDeposit} deposit
                        </Rb_Text>
                    </div>

                    <div className="flex md:justify-end">
                        <Rb_Icon
                            data-testid="rb-icon"
                            icon={FaTrashAlt}
                            className="cursor-pointer text-gray-400 hover:text-red-500"
                            onClick={() => setDeleteModalOpen(true)}
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
            >
                <ModalHeader
                    onClose={() => setDeleteModalOpen(false)}
                >
                    Remove Book
                </ModalHeader>

                <ModalBody>
                    Are you sure you want to remove{" "}
                    <strong>{item.bookId.name}</strong> from your cart?
                </ModalBody>

                <ModalFooter>
                    <Rb_Button
                        variant="secondary"
                        onClick={() => setDeleteModalOpen(false)}
                    >
                        Cancel
                    </Rb_Button>

                    <Rb_Button
                        className="!bg-red-500"
                        onClick={handleDelete}
                        disabled={isDeletingItem}
                    >
                        Remove
                    </Rb_Button>
                </ModalFooter>
            </Modal>
        </>
    );
}