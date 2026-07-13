export const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "success"
) => {
    window.dispatchEvent(
        new CustomEvent("app-toast-notification", {
            detail: {
                message,
                type,
            },
        })
    );
};