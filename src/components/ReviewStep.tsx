import { Rb_Text } from "@rentbook/rentbook-ui-lib";
import { useCheckout } from "../hooks/CheckoutContext";

export default function ReviewStep() {
    const { checkoutData } = useCheckout();

    const { shippingAddress, amount } = checkoutData;

    const isAuction =
        checkoutData.orderType === "auction";

    return (
        <div className="space-y-6">

            {/* SHIPPING ADDRESS */}
            <div className="rounded-lg border border-gray-200 p-4">
                <Rb_Text
                    variant="h4"
                    className="mb-3 font-semibold"
                >
                    Shipping Address
                </Rb_Text>

               {shippingAddress && (
  <div className="text-sm text-gray-600">
    <p>{shippingAddress.name}</p>

    <p>{shippingAddress.addressLine1}</p>

    {shippingAddress.addressLine2 && (
      <p>{shippingAddress.addressLine2}</p>
    )}

    <p>
      {shippingAddress.city}, {shippingAddress.state}
    </p>

    <p>
      {shippingAddress.country} - {shippingAddress.zipCode}
    </p>

    <p>
      Phone: {shippingAddress.phone}
    </p>
  </div>
)}
            </div>

            {/* ORDER SUMMARY */}
            <div className="rounded-lg border border-gray-200 p-4">

                <div className="mb-4 flex items-center justify-between">
                    <Rb_Text
                        variant="h4"
                        className="font-semibold"
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
                        {isAuction
                            ? "Auction"
                            : "Rent"}
                    </span>
                </div>

                {amount && (
                    <div className="space-y-3 text-sm">

                        {isAuction ? (
                            <>
                                <div className="flex justify-between">
                                    <span>
                                        Winning Bid
                                    </span>

                                    <span>
                                        ₹
                                        {amount.itemAmount}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>
                                        Delivery Charges
                                    </span>

                                    <span>
                                        ₹
                                        {amount.deliveryFee}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>
                                        Discount
                                    </span>

                                    <span>
                                        ₹
                                        {amount.discount}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>
                                        Tax
                                    </span>

                                    <span>
                                        ₹
                                        {amount.tax.toFixed(2)}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between">
                                    <span>
                                        Rental Amount
                                    </span>

                                    <span>
                                        ₹
                                        {amount.rentalAmount}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>
                                        Security Deposit
                                    </span>

                                    <span>
                                        ₹
                                        {amount.securityDeposit}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>
                                        Delivery Charges
                                    </span>

                                    <span>
                                        ₹
                                        {amount.deliveryFee}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>
                                        Discount
                                    </span>

                                    <span>
                                        ₹
                                        {amount.discount}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>
                                        Tax
                                    </span>

                                    <span>
                                        ₹
                                        {amount.tax.toFixed(2)}
                                    </span>
                                </div>
                            </>
                        )}

                        <div className="flex justify-between border-t pt-3 font-bold">
                            <span>Total</span>

                            <span>
                                ₹
                                {amount.totalAmount}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}