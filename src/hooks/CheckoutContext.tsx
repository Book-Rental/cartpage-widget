import {
    createContext,
    ReactNode,
    useContext,
    useState,
} from "react";

import { Address } from "../types/cart";
type CheckoutStep =
    | "address"
    | "review"
    | "payment";

interface CheckoutItem {
    bookId: string;
    quantity: number;
    rentalType: string;
}

interface PaymentDetails {
    paymentMethod: string;
    transactionId: string;
    paymentStatus: string;
}

interface AmountDetails {
    rentalAmount: number;
    securityDeposit: number;
    deliveryFee: number;
    discount: number;
    tax: number;
    totalAmount: number;
}

interface CheckoutRequest {
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
    const [step, setStep] = useState<CheckoutStep>("address");

    const [checkoutData, setCheckoutData] =
        useState<CheckoutRequest>(initialCheckoutData);

    const resetCheckout = () => {
        setStep("address");
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