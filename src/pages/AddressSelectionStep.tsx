import { useEffect, useState } from "react";
import { Rb_LoadingSpinner } from "@rentbook/rentbook-ui-lib";

import { Address } from "../types/cart";
import { useCheckout } from "../hooks/CheckoutContext";
import { useValidateAddress } from "../hooks/useValidateAddress";

const PROFILE_WIDGET_URL = import.meta.env.VITE_PROFILE_WIDGET;
const WIDGET_CONTAINER_ID = "profile-widget";

export default function AddressSelectionStep() {
    const [isLoading, setIsLoading] = useState(true);
    const {
        mutate: validateAddress,
    } = useValidateAddress();
    const { setCheckoutData } = useCheckout();

    useEffect(() => {
        if (!PROFILE_WIDGET_URL) return;

        const container = document.getElementById(WIDGET_CONTAINER_ID);
        if (!container) return;

        const handleWidgetLoading = (event: Event) => {
            const customEvent = event as CustomEvent<boolean>;
            if (customEvent.detail !== undefined) {
                setIsLoading(customEvent.detail);
            }
        };
        console.log("isLoading state:", isLoading);
        const handleAddressSelected = (event: Event) => {
            const customEvent = event as CustomEvent<Address>;
            const selectedAddress = customEvent.detail;

            if (!selectedAddress?.zipCode) {
                console.error("Selected address does not contain zipCode");
                return;
            }
            const pincode = selectedAddress.zipCode;
            validateAddress(pincode, {
                onSuccess: (response) => {
                    console.log("Address validation response:", response);

                    setCheckoutData((prev) => ({
                        ...prev,
                        shippingAddress: selectedAddress,
                        billingAddress: selectedAddress,
                    }));
                },

                onError: (error) => {
                    console.error("Address validation failed:", error);
                },
            });
        };
        window.addEventListener(
            "profile-address-selected",
            handleAddressSelected
        );

        window.addEventListener(
            "widget-loading-status",
            handleWidgetLoading
        );

        const script = document.createElement("script");
        script.src = PROFILE_WIDGET_URL;
        script.async = true;

        script.onload = () => {


            window.renderReactWidget?.(
                JSON.stringify({
                    containerElementId: WIDGET_CONTAINER_ID,
                    name: "profile_Widget",
                    view: "address",
                })
            );
        };

        document.body.appendChild(script);

        return () => {
            window.unmountReactWidget?.(WIDGET_CONTAINER_ID);

            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }

            window.removeEventListener(
                "widget-loading-status",
                handleWidgetLoading
            );

            window.removeEventListener(
                "profile-address-selected",
                handleAddressSelected
            );
        };
    }, [setCheckoutData]);

    return (
        <div className="relative w-full min-h-[300px]">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
                    <Rb_LoadingSpinner />
                </div>
            )}

            <div
                id={WIDGET_CONTAINER_ID}
                className={
                    isLoading
                        ? "invisible h-0 overflow-hidden"
                        : "w-full"
                }
            />
        </div>
    );
}