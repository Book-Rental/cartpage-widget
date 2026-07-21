import type { ReactNode } from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CartItem from "../components/CartItem";
import { CartItemType } from "../types/cart";
import { showToast } from "../utils/ToastFunction";

interface MockModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

interface MockModalHeaderProps {
    onClose: () => void;
    children: ReactNode;
}

interface MockDropdownOption {
    label: string;
    value: string;
}

interface MockDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: MockDropdownOption[];
}

interface MockQuantityProps {
    value: number;
    min?: number;
    disabled?: boolean;
    onChange: (value: number) => void;
}

interface DeleteMutateOptions {
    onSuccess: () => void;
    onError: () => void;
}

interface UpdateQuantityMutateOptions {
    onError?: () => void;
}

const deleteMutateMock = vi.fn();
const updateQuantityMutateMock = vi.fn();

vi.mock("../hooks/useDeleteCartItem", () => ({
    useDeleteCartItem: () => ({
        mutate: deleteMutateMock,
        isPending: false,
    }),
}));

vi.mock("../hooks/useUpdateCart", () => ({
    useUpdateCartQuantity: () => ({
        mutate: updateQuantityMutateMock,
        isPending: false,
    }),
}));

vi.mock("../utils/ToastFunction", () => ({
    showToast: vi.fn(),
}));

vi.mock("@rentbook/rentbook-ui-lib", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@rentbook/rentbook-ui-lib")>();
    return {
        ...actual,
        Modal: ({ isOpen, onClose, children }: MockModalProps) =>
            isOpen ? (
                <div data-testid="modal">
                    <button data-testid="modal-backdrop-close" onClick={onClose}>
                        Backdrop Close
                    </button>
                    {children}
                </div>
            ) : null,
        ModalHeader: ({ onClose, children }: MockModalHeaderProps) => (
            <div>
                <span>{children}</span>
                <button data-testid="modal-header-close" onClick={onClose}>
                    ×
                </button>
            </div>
        ),
        Dropdown: ({ value, onChange, options }: MockDropdownProps) => (
            <select
                data-testid="dropdown"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        ),
        Rb_Quantity: ({ value, disabled, onChange }: MockQuantityProps) => (
            <div data-testid="quantity">
                <span>Qty: {value}</span>
                <button
                    data-testid="quantity-increment"
                    disabled={disabled}
                    onClick={() => onChange(value + 1)}
                >
                    +
                </button>
            </div>
        ),
    };
});

const buildItem = (overrides: Partial<CartItemType> = {}): CartItemType => ({
    bookId: {
        _id: "1",
        name: "Atomic Habits",
        author: "James Clear",
        description: "A good book",
        coverImage: "cover.jpg",
        purchasePrice: 500,
        rentalPricePerDay: 20,
        rentalPricePerWeek: 100,
        rentalPricePerMonth: 300,
        securityDeposit: 1000,
    },
    quantity: 1,
    pricingMode: "rent",
    rentalPeriod: "day",
    addedAt: "",
    ...overrides,
});

const mockItem = buildItem();

function renderWithClient(ui: React.ReactElement) {
    const queryClient = new QueryClient();
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
}

describe("CartItem", () => {
    beforeEach(() => {
        deleteMutateMock.mockClear();
        updateQuantityMutateMock.mockClear();
        vi.mocked(showToast).mockClear();
    });

    it("renders the book name", () => {
        renderWithClient(<CartItem item={mockItem} />);
        expect(screen.getByText("Atomic Habits")).toBeInTheDocument();
    });

    it("renders the author name", () => {
        renderWithClient(<CartItem item={mockItem} />);
        expect(screen.getByText(/James Clear/i)).toBeInTheDocument();
    });

    it("renders the quantity", () => {
        renderWithClient(<CartItem item={mockItem} />);
        expect(screen.getByTestId("quantity")).toBeInTheDocument();
        expect(screen.getByText("Qty: 1")).toBeInTheDocument();
    });

    it("updates quantity and calls the mutation when changed", () => {
        renderWithClient(<CartItem item={mockItem} />);

        fireEvent.click(screen.getByTestId("quantity-increment"));

        expect(screen.getByText("Qty: 2")).toBeInTheDocument();
        expect(updateQuantityMutateMock).toHaveBeenCalledWith(
            {
                bookId: "1",
                quantity: 2,
                pricingMode: "rent",
                rentalPeriod: "day",
            },
            expect.any(Object)
        );
    });

    it("reverts quantity and shows an error toast if the update fails", async () => {
        renderWithClient(<CartItem item={mockItem} />);

        fireEvent.click(screen.getByTestId("quantity-increment"));
        expect(screen.getByText("Qty: 2")).toBeInTheDocument();

        const { onError } = updateQuantityMutateMock.mock
            .calls[0][1] as UpdateQuantityMutateOptions;

        await act(async () => {
            onError?.();
        });

        await waitFor(() => {
            expect(screen.getByText("Qty: 1")).toBeInTheDocument();
        });

        expect(showToast).toHaveBeenCalledWith(
            "Failed to update quantity",
            "error"
        );
    });

    it("renders rental price for a daily rental", () => {
        renderWithClient(<CartItem item={mockItem} />);
        expect(screen.getByText("₹20")).toBeInTheDocument();
    });

    it("renders rental price for a weekly rental", () => {
        const weeklyItem = buildItem({ rentalPeriod: "week" });
        renderWithClient(<CartItem item={weeklyItem} />);
        expect(screen.getByText("₹100")).toBeInTheDocument();
    });

    it("renders rental price for a monthly rental", () => {
        const monthlyItem = buildItem({ rentalPeriod: "month" });
        renderWithClient(<CartItem item={monthlyItem} />);
        expect(screen.getByText("₹300")).toBeInTheDocument();
    });

    it("renders ₹0 for an unrecognized rental period", () => {
        const unknownItem = buildItem({
            rentalPeriod: "year" as CartItemType["rentalPeriod"],
        });
        renderWithClient(<CartItem item={unknownItem} />);
        expect(screen.getByText("₹0")).toBeInTheDocument();
    });

    it("renders security deposit", () => {
        renderWithClient(<CartItem item={mockItem} />);
        expect(screen.getByText("₹1000 deposit")).toBeInTheDocument();
    });

    it("renders duration dropdown", () => {
        renderWithClient(<CartItem item={mockItem} />);
        expect(screen.getByText("Duration")).toBeInTheDocument();
    });

    it("logs the new value when the duration dropdown changes", () => {
        const logSpy = vi.spyOn(console, "log").mockImplementation(() => { });

        renderWithClient(<CartItem item={mockItem} />);

        fireEvent.change(screen.getByTestId("dropdown"), {
            target: { value: "week" },
        });

        expect(logSpy).toHaveBeenCalledWith("week");
        logSpy.mockRestore();
    });

    it("opens remove modal", () => {
        renderWithClient(<CartItem item={mockItem} />);

        fireEvent.click(screen.getByTestId("rb-icon"));

        expect(screen.getByText("Remove Book")).toBeInTheDocument();
        expect(
            screen.getByText(/Are you sure you want to remove/i)
        ).toBeInTheDocument();
    });

    it("closes modal when cancel is clicked", () => {
        renderWithClient(<CartItem item={mockItem} />);

        fireEvent.click(screen.getByTestId("rb-icon"));
        fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

        expect(screen.queryByText("Remove Book")).not.toBeInTheDocument();
    });

    it("closes modal via the modal's onClose (backdrop)", () => {
        renderWithClient(<CartItem item={mockItem} />);

        fireEvent.click(screen.getByTestId("rb-icon"));
        expect(screen.getByText("Remove Book")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("modal-backdrop-close"));
        expect(screen.queryByText("Remove Book")).not.toBeInTheDocument();
    });

    it("closes modal via the modal header's onClose", () => {
        renderWithClient(<CartItem item={mockItem} />);

        fireEvent.click(screen.getByTestId("rb-icon"));
        expect(screen.getByText("Remove Book")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("modal-header-close"));
        expect(screen.queryByText("Remove Book")).not.toBeInTheDocument();
    });

    it("calls delete mutation when remove button is clicked", () => {
        renderWithClient(<CartItem item={mockItem} />);

        fireEvent.click(screen.getByTestId("rb-icon"));
        fireEvent.click(screen.getByRole("button", { name: /remove/i }));

        expect(deleteMutateMock).toHaveBeenCalledTimes(1);
        expect(deleteMutateMock).toHaveBeenCalledWith(
            {
                bookId: "1",
                pricingMode: "rent",
                rentalPeriod: "day",
            },
            expect.any(Object)
        );
    });

    it("closes the modal and shows a success toast on successful delete", async () => {
        renderWithClient(<CartItem item={mockItem} />);

        fireEvent.click(screen.getByTestId("rb-icon"));
        expect(screen.getByText("Remove Book")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /remove/i }));

        const { onSuccess } = deleteMutateMock.mock.calls[0][1] as DeleteMutateOptions;
        onSuccess();

        await waitFor(() => {
            expect(screen.queryByText("Remove Book")).not.toBeInTheDocument();
        });

        expect(showToast).toHaveBeenCalledWith("Atomic Habits removed from cart");
    });

    it("shows an error toast when delete fails", () => {
        renderWithClient(<CartItem item={mockItem} />);

        fireEvent.click(screen.getByTestId("rb-icon"));
        fireEvent.click(screen.getByRole("button", { name: /remove/i }));

        const { onError } = deleteMutateMock.mock.calls[0][1] as DeleteMutateOptions;
        onError();

        expect(showToast).toHaveBeenCalledWith(
            "Failed to remove book from cart",
            "error"
        );
    });
});