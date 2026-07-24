import {
    createContext,
    ReactNode,
    useContext,
    useState,
} from "react";

import { CheckoutRequest } from "../types/checkout";

type CheckoutStep =
    | "address"
    | "review"
    | "payment";

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

export const CheckoutContext = createContext<
    CheckoutContextType | undefined
>(undefined);

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