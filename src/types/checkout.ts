import { Address } from "./cart";

export interface CheckoutItem {
    bookId: string;
    quantity: number;
    rentalType?: string;
}

export interface PaymentDetails {
    paymentMethod: string;
    transactionId: string;
    paymentStatus: string;
}

export interface AmountDetails {
    itemAmount?: number;
    rentalAmount?: number;
    securityDeposit: number;
    deliveryFee: number;
    discount: number;
    tax: number;
    totalAmount: number;
}

export interface CheckoutRequest {
    userId: string;
    items: CheckoutItem[];
    shippingAddress: Address | null;
    billingAddress: Address | null;

    orderType: "rent" | "auction";
    auctionId?: string;

    payment: PaymentDetails | null;
    amount: AmountDetails | null;
}