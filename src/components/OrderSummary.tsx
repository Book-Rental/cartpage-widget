import { useEffect, useState } from "react";
import { Rb_Button, Rb_Text } from "@rentbook/rentbook-ui-lib";
import { CartSummary } from "../types/cart";

interface Props {
    summary: CartSummary;
    itemCount: number;
    onCheckout: () => void;
    orderType?: "rent" | "auction";
}

export default function OrderSummary({
    summary,
    itemCount,
    onCheckout,
    orderType = "rent",
}: Props) {
    const hasItems = itemCount > 0;
    const isLoggedIn = !!window.HOST_USER_INFO;

    const isAuction = orderType === "auction";

    const [currentBidPrice, setCurrentBidPrice] = useState(0);

    useEffect(() => {
    if (!isAuction) {
        return;
    }

    const historyState = window.history.state;

    console.log("ORDER SUMMARY HISTORY STATE:", historyState);

    const auctionId = historyState?.auctionId;

    console.log("ORDER SUMMARY AUCTION ID:", auctionId);

    if (!auctionId) {
        console.error(
            "Auction ID is missing from window.history.state"
        );
        return;
    }

    const fetchCurrentBid = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL;

            const url = `${apiUrl}/api/auction/${auctionId}/bids`;

            console.log("FETCHING AUCTION URL:", url);

            const response = await fetch(url, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch auction bids: ${response.status}`
                );
            }

            const result = await response.json();

            console.log("AUCTION BIDS RESPONSE:", result);

            const currentBid = Number(
                result?.data?.auction?.currentBidPrice
            );

            console.log("CURRENT BID PRICE FROM API:", currentBid);

            if (!Number.isNaN(currentBid)) {
                setCurrentBidPrice(currentBid);
            }
        } catch (error) {
            console.error(
                "FAILED TO FETCH CURRENT BID:",
                error
            );

            setCurrentBidPrice(0);
        }
    };

    fetchCurrentBid();
}, [isAuction]);

    const winningBidPrice = isAuction
        ? currentBidPrice
        : summary.subtotal;

    const handleProceedClick = () => {
        if (isLoggedIn) {
            onCheckout();
            return;
        }

        window.history.pushState({}, "", "/auth");
        window.dispatchEvent(new PopStateEvent("popstate"));
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-6 flex items-center justify-between">
                <Rb_Text
                    variant="h2"
                    className="text-xl font-semibold sm:text-2xl"
                >
                    Order Summary
                </Rb_Text>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                        isAuction
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                    }`}
                >
                    {isAuction ? "Auction" : "Rent"}
                </span>
            </div>

            {!hasItems ? (
                <div className="py-10 text-center">
                    <Rb_Text className="text-3xl font-medium text-gray-600">
                        Add books to your cart to view the order summary.
                    </Rb_Text>
                </div>
            ) : (
                <>
                    <div className="space-y-5">
                        {isAuction ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <Rb_Text>
                                        Winning Bid
                                    </Rb_Text>

                                    <Rb_Text>
                                        ₹{winningBidPrice}
                                    </Rb_Text>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Rb_Text>
                                        Delivery Charges
                                    </Rb_Text>

                                    <Rb_Text>
                                        ₹{summary.deliveryFee}
                                    </Rb_Text>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Rb_Text>
                                        Discount
                                    </Rb_Text>

                                    <Rb_Text>
                                        ₹0
                                    </Rb_Text>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Rb_Text>
                                        Tax
                                    </Rb_Text>

                                    <Rb_Text>
                                        ₹{summary.tax.toFixed(2)}
                                    </Rb_Text>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <Rb_Text>
                                        Rental Charges ({itemCount}{" "}
                                        {itemCount === 1
                                            ? "Book"
                                            : "Books"}
                                        )
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
                                        ₹{summary.deliveryFee}
                                    </Rb_Text>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Rb_Text>
                                        Discount
                                    </Rb_Text>

                                    <Rb_Text>
                                        ₹0
                                    </Rb_Text>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Rb_Text>
                                        Tax
                                    </Rb_Text>

                                    <Rb_Text>
                                        ₹{summary.tax.toFixed(2)}
                                    </Rb_Text>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="my-6 border-t pt-6">
                        <div className="flex items-center justify-between">
                            <Rb_Text
                                variant="h4"
                                className="font-bold"
                            >
                                Total Amount
                            </Rb_Text>

                            <Rb_Text
                                variant="h4"
                                className="font-bold"
                            >
                                ₹{summary.total}
                            </Rb_Text>
                        </div>
                    </div>

                    <Rb_Button
                        className="mt-2 w-full"
                        onClick={handleProceedClick}
                        disabled={!hasItems}
                    >
                        {isLoggedIn
                            ? "Proceed to Checkout"
                            : "Login to Proceed"}
                    </Rb_Button>
                </>
            )}
        </div>
    );
}