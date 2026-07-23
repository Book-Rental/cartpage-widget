export interface Book {
    _id: string;
    name: string;
    author: string;
    description: string;
    coverImage: string;
    purchasePrice: number;
    rentalPricePerDay: number;
    rentalPricePerWeek: number;
    rentalPricePerMonth: number;
    securityDeposit: number;
}
export interface CartItemType {
    bookId: Book;
    quantity: number;
    pricingMode: "rent" | "buy";
    rentalPeriod: "day" | "week" | "month";
    addedAt: string;
}
export interface SummaryItem {
    bookId: string;
    quantity: number;
    pricingMode: string;
    rentalPeriod: string;
    unitPrice: number;
    lineSubtotal: number;
    securityDepositLine: number;
}

export interface CartSummary {

    subtotal: number;
    securityDepositTotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    items: SummaryItem[];
}

export interface CartData {
    _id: string;
    userId: string;
    items: CartItemType[];
    createdAt: string;
    updatedAt: string;
    summary: CartSummary;
}

export interface CartResponse {
    status: string;
    message: string;
    data: CartData;
}


export interface RemoveCartItemPayload {
    bookId: string;
    pricingMode: "rent" | "buy";
    rentalPeriod: "day" | "week" | "month";
}

export interface InvalidCartItem {
    bookId: string;
    reason: string;
}

export interface ValidateCartData {
    userId: string;
    isValid: boolean;
    invalidItems: InvalidCartItem[];
    validationSummary: {
        totalItems: number;
        invalidCount: number;
    };
}

export interface ValidateCartResponse {
    status: string;
    message: string;
    data: ValidateCartData;
}

export interface Address {
    name: string;
    phone: string;
    type: "home" | "work" | "other"; // Enforces your specific schema enum types
    addressLine1: string;
    addressLine2?: string; // Optional field field guard
    landmark?: string;    // Optional field field guard
    city: string;
    state: string;
    pincode: string;
    country: string;
}

export interface UpdateCartQuantityPayload {
    bookId: string;
    quantity: number;
    pricingMode: string;
    rentalPeriod: string;
}
export interface UpdateRentalPeriodPayload {
    bookId: string;
    pricingMode: string;
    currentRentalPeriod: string;
    newRentalPeriod: string;
}