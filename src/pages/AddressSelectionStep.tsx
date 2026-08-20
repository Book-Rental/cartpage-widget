import { useEffect, useRef, useState } from "react";
import { Rb_LoadingSpinner } from "@rentbook/rentbook-ui-lib";

import { Address } from "../types/cart";
import { useCheckout } from "../hooks/CheckoutContext";
import { useValidateAddress } from "../hooks/useValidateAddress";
import { showToast } from "../utils/ToastFunction";

const PROFILE_WIDGET_URL = import.meta.env.VITE_PROFILE_WIDGET;
const WIDGET_CONTAINER_ID = "profile-widget";

interface AddressSelectionStepProps {
    onAddressValidationChange: (isValid: boolean) => void;
}


export default function AddressSelectionStep({
    onAddressValidationChange,
}: AddressSelectionStepProps) {
    const [isLoading, setIsLoading] = useState(true);

    const isValidatingAddress = useRef(false);
    const lastValidatedPincode = useRef<string | null>(null);

    const { mutate: validateAddress } = useValidateAddress();
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

        const handleAddressSelected = (event: Event) => {
            const customEvent = event as CustomEvent<Address>;
            const selectedAddress = customEvent.detail;
            if (!selectedAddress?.zipCode) {
                onAddressValidationChange(false);

                showToast(
                    "Selected address does not contain a valid ZIP code.",
                    "error"
                );

                return;
            }

            const pincode = selectedAddress.zipCode;
            if (
                isValidatingAddress.current ||
                pincode === lastValidatedPincode.current
            ) {
                console.log(
                    "Ignoring duplicate profile-address-selected event for",
                    pincode
                );
                return;
            }

            isValidatingAddress.current = true;
            lastValidatedPincode.current = pincode;

            validateAddress(pincode, {
                onSuccess: (response) => {
                    if (response?.data?.isValid === true) {
                        setCheckoutData((prev) => ({
                            ...prev,
                            shippingAddress: selectedAddress,
                            billingAddress: selectedAddress,
                        }));

                        onAddressValidationChange(true);

                        showToast(
                            "Address validated successfully.",
                            "success"
                        );
                    } else {
                        onAddressValidationChange(false);

                        showToast(
                            response?.data?.message ||
                            "The selected address is not serviceable.",
                            "error"
                        );
                    }

                    isValidatingAddress.current = false;
                },

                onError: (error) => {
                    console.error("Address validation failed:", error);

                    onAddressValidationChange(false);

                    showToast(
                        "Unable to validate the address. Please try again.",
                        "error"
                    );

                    isValidatingAddress.current = false;
                    lastValidatedPincode.current = null;
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
        const existingScript = document.querySelector(
            `script[src="${PROFILE_WIDGET_URL}"]`
        );

        const script = existingScript ?? document.createElement("script");

        if (!existingScript) {
            script.setAttribute("src", PROFILE_WIDGET_URL);
            script.setAttribute("async", "true");

            script.addEventListener("load", () => {
                window.renderReactWidget?.(
                    JSON.stringify({
                        containerElementId: WIDGET_CONTAINER_ID,
                        name: "profile_Widget",
                        view: "address",
                    })
                );
            });

            document.body.appendChild(script);
        } else {

            window.renderReactWidget?.(
                JSON.stringify({
                    containerElementId: WIDGET_CONTAINER_ID,
                    name: "profile_Widget",
                    view: "address",
                })
            );
        }

        return () => {
            window.unmountReactWidget?.(WIDGET_CONTAINER_ID);

            if (!existingScript && document.body.contains(script)) {
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

    }, []);

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