import CartItem from "../components/CartItem";
import OrderSummary from "../components/OrderSummary";
import { cartItems } from "../types/cartData";

export default function Cart() {
    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:gap-8 sm:p-6">

            <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-8">

                <h1 className="mb-6 text-xl font-semibold sm:mb-8 sm:text-2xl">
                    Your Cart ({cartItems.length} Items)
                </h1>

                <div className="space-y-6 sm:space-y-8">
                    {cartItems.map((item) => (
                        <CartItem key={item.id} item={item} />
                    ))}
                </div>

            </div>

            <OrderSummary />

        </div>
    );
}