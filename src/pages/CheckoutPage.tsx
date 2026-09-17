import { useEffect, useState } from "react";
import { Rb_LoadingSpinner } from "@rentbook/rentbook-ui-lib";

import { useCheckout } from "../hooks/CheckoutContext";
import { usePlaceOrder } from "../hooks/usePlaceOrder";
import { useClearCart } from "../hooks/useClearCart";
import { CheckoutRequest } from "../types/checkout";

const CheckoutPage: React.FC = () => {
  const paymentWidgetUrl =
    import.meta.env.VITE_PAYMENT_WIDGET_URL;

  const returnUrl =
    import.meta.env.VITE_RETURN_URL;

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL;

  const { checkoutData, setCheckoutData } =
    useCheckout();

  const { mutate: clearCart, isPending } =
    useClearCart();

  const { mutate: placeOrder } =
    usePlaceOrder();

  const [auctionLoading, setAuctionLoading] =
    useState(false);

  const [auctionBookId, setAuctionBookId] =
    useState("");

  const [currentBidPrice, setCurrentBidPrice] =
    useState(0);

  /* --------------------------------
     Auction checkout information
  -------------------------------- */

  const historyState = window.history.state;

  const isAuctionCheckout =
    historyState?.orderType === "auction";

  const auctionId =
    historyState?.auctionId;

  const userId =
    historyState?.userId ||
    window.HOST_USER_INFO?._id ||
    checkoutData.userId ||
    "";

  /* --------------------------------
     Auction amount calculation
  -------------------------------- */

  const auctionDeliveryFee =
    checkoutData.amount?.deliveryFee ?? 0;

  const auctionDiscount = 0;

  const auctionSecurityDeposit = 0;

  const auctionTax =
    currentBidPrice * 0.05;

  const auctionTotalAmount =
    currentBidPrice +
    auctionDeliveryFee +
    auctionTax;

  /* --------------------------------
     Payment amount
  -------------------------------- */

  const totalAmount = isAuctionCheckout
    ? auctionTotalAmount
    : checkoutData.amount?.totalAmount ?? 0;

  /* --------------------------------
     Fetch auction details
  -------------------------------- */

  useEffect(() => {
    if (!isAuctionCheckout) {
      return;
    }

    if (!auctionId) {
      console.error("Auction ID not found");
      return;
    }

    const fetchAuctionDetails = async () => {
      try {
        setAuctionLoading(true);

        const response = await fetch(
          `${baseUrl}/auction/${auctionId}/bids`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const result = await response.json();

        console.log(
          "Auction bids response:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to fetch auction bids"
          );
        }

        const auction =
          result.data?.auction;

        const book =
          result.data?.book;

        if (!auction || !book) {
          throw new Error(
            "Auction or book details not found"
          );
        }

        setAuctionBookId(book._id);

        setCurrentBidPrice(
          auction.currentBidPrice ?? 0
        );

        console.log(
          "Auction bookId:",
          book._id
        );

        console.log(
          "Current bid price:",
          auction.currentBidPrice
        );
      } catch (error) {
        console.error(
          "Auction details API failed:",
          error
        );
      } finally {
        setAuctionLoading(false);
      }
    };

    fetchAuctionDetails();
  }, [
    isAuctionCheckout,
    auctionId,
    baseUrl,
  ]);

  /* --------------------------------
     Load payment widget
  -------------------------------- */

  useEffect(() => {
    if (!paymentWidgetUrl) {
      return;
    }

    if (
      isAuctionCheckout &&
      auctionLoading
    ) {
      return;
    }

    const containerId =
      "test-widget-container";

    const container =
      document.getElementById(containerId);

    if (!container) {
      return;
    }

    container.setAttribute(
      "data-price",
      String(totalAmount)
    );

    container.setAttribute(
      "data-merchant-name",
      "RentBook"
    );

    container.setAttribute(
      "data-currency",
      "INR"
    );

    container.setAttribute(
      "data-return-url",
      returnUrl
    );

    container.setAttribute(
      "data-no-forwarding-path",
      "true"
    );

    const script =
      document.createElement("script");

    script.src = paymentWidgetUrl;
    script.async = true;

    script.onload = () => {
      window.renderReactWidget?.(
        JSON.stringify({
          containerElementId:
            containerId,
        })
      );
    };

    document.body.appendChild(script);

    return () => {
      window.unmountReactWidget?.(
        containerId
      );

      if (
        document.body.contains(script)
      ) {
        document.body.removeChild(
          script
        );
      }
    };
  }, [
    paymentWidgetUrl,
    returnUrl,
    totalAmount,
    isAuctionCheckout,
    auctionLoading,
  ]);

  /* --------------------------------
     Create order after payment
  -------------------------------- */

  useEffect(() => {
    const createOrder = (
      paymentMethod: string,
      transactionId: string,
      paymentStatus: string
    ) => {
     const payload: CheckoutRequest = {
  userId:
    checkoutData.userId ||
    userId,

  items: isAuctionCheckout
    ? [
        {
          bookId: auctionBookId,
          quantity: 1,
        },
      ]
    : checkoutData.items,

  shippingAddress:
    checkoutData.shippingAddress,

  billingAddress:
    checkoutData.billingAddress,

  orderType: isAuctionCheckout
    ? "auction"
    : "rent",

  ...(isAuctionCheckout && {
    auctionId,
  }),

  payment: {
    paymentMethod,
    transactionId,
    paymentStatus,
  },

  amount: isAuctionCheckout
    ? {
        itemAmount:
          currentBidPrice,

        rentalAmount: 0,

        securityDeposit:
          auctionSecurityDeposit,

        deliveryFee:
          auctionDeliveryFee,

        discount:
          auctionDiscount,

        tax:
          auctionTax,

        totalAmount:
          auctionTotalAmount,
      }
    : checkoutData.amount,
};

      console.log(
        "Final order payload:",
        payload
      );

      /*
       * Preserve the existing checkout data.
       * Only add auction orderType when this
       * is actually an auction checkout.
       */
      setCheckoutData({
        ...checkoutData,
        ...payload,
        ...(isAuctionCheckout && {
          orderType: "auction",
        }),
      });

      placeOrder(payload, {
        onSuccess: () => {
          console.log(
            "Order placed successfully"
          );

          clearCart();

          window.history.pushState(
            {},
            "",
            "/OrderConform"
          );

          window.dispatchEvent(
            new PopStateEvent("popstate")
          );
        },

        onError: (error) => {
          console.error(
            "Order placement failed:",
            error
          );
        },
      });
    };

    /* --------------------------------
       Payment success
    -------------------------------- */

    const handlePaymentSuccess = (
      event: Event
    ) => {
      const customEvent =
        event as CustomEvent;

      const {
        paymentMethod,
        transactionId,
        paymentStatus,
      } = customEvent.detail;

      createOrder(
        paymentMethod,
        transactionId,
        paymentStatus ?? "SUCCESS"
      );
    };

    /* --------------------------------
       Payment failure
    -------------------------------- */

    const handlePaymentFailure = (
      event: Event
    ) => {
      const customEvent =
        event as CustomEvent;

      console.log(
        "Payment failed:",
        customEvent.detail
      );

      createOrder(
        "COD",
        "",
        "FAILED"
      );
    };

    window.addEventListener(
      "payment-widget-success",
      handlePaymentSuccess
    );

    window.addEventListener(
      "payment-widget-failure",
      handlePaymentFailure
    );

    return () => {
      window.removeEventListener(
        "payment-widget-success",
        handlePaymentSuccess
      );

      window.removeEventListener(
        "payment-widget-failure",
        handlePaymentFailure
      );
    };
  }, [
    checkoutData,
    userId,
    isAuctionCheckout,
    auctionId,
    auctionBookId,
    currentBidPrice,
    auctionDeliveryFee,
    auctionDiscount,
    auctionSecurityDeposit,
    auctionTax,
    auctionTotalAmount,
    setCheckoutData,
    placeOrder,
    clearCart,
  ]);

  /* --------------------------------
     Loading
  -------------------------------- */

  if (auctionLoading) {
    return <Rb_LoadingSpinner />;
  }

  if (isPending) {
    return <Rb_LoadingSpinner />;
  }

  return (
    <div
      id="test-widget-container"
      className="mb-6"
    />
  );
};

export default CheckoutPage;