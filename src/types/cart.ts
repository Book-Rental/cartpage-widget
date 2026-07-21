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
    _id: string;
    name: string;
    type: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    isDefault?: boolean;
}

export interface UpdateCartQuantityPayload {
    bookId: string;
    quantity: number;
    pricingMode: string;
    rentalPeriod: string;
}