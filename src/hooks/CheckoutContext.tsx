import {
    createContext,
    ReactNode,
    useContext,
    useState,
} from "react";

import { Address } from "../types/cart";

export type CheckoutStep =
    | "validation"
    | "address"
    | "review"
    | "payment";

export interface CheckoutItem {
    bookId: string;
    quantity: number;
    rentalType: string;
}

export interface PaymentDetails {
    paymentMethod: string;
    transactionId: string;
}

export interface AmountDetails {
    rentalAmount: number;
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
    payment: PaymentDetails | null;
    amount: AmountDetails | null;
}

interface CheckoutContextType {
    step: CheckoutStep;
    setStep: React.Dispatch<React.SetStateAction<CheckoutStep>>;

    checkoutData: CheckoutRequest;
    setCheckoutData: React.Dispatch<
        React.SetStateAction<CheckoutRequest>
    >;

    resetCheckout: () => void;
}

const initialCheckoutData: CheckoutRequest = {
    userId: "",
    items: [],
    shippingAddress: null,
    billingAddress: null,
    payment: null,
    amount: null,
};

const CheckoutContext = createContext<CheckoutContextType | undefined>(
    undefined
);

export function CheckoutProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [step, setStep] =
        useState<CheckoutStep>("validation");

    const [checkoutData, setCheckoutData] =
        useState<CheckoutRequest>(initialCheckoutData);

    const resetCheckout = () => {
        setStep("validation");
        setCheckoutData(initialCheckoutData);
    };

    return (
        <CheckoutContext.Provider
            value={{
                step,
                setStep,
                checkoutData,
                setCheckoutData,
                resetCheckout,
            }}
        >
            {children}
        </CheckoutContext.Provider>
    );
}

export function useCheckout() {
    const context = useContext(CheckoutContext);

    if (!context) {
        throw new Error(
            "useCheckout must be used within CheckoutProvider"
        );
    }

    return context;
}