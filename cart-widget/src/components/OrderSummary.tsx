import { Rb_Button, Rb_Text } from "rentbook-ui-lib";

export default function OrderSummary() {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-8">

            <Rb_Text variant="h2" className="mb-6">
                Order Summary
            </Rb_Text>

            <div className="space-y-5">

                <div className="flex justify-between">
                    <Rb_Text variant="p">Rental Charges (2 Books)</Rb_Text>
                    <Rb_Text variant="p">₹148</Rb_Text>
                </div>

                <div className="flex justify-between">
                    <Rb_Text variant="p">Security Deposit</Rb_Text>
                    <Rb_Text variant="p">₹400</Rb_Text>
                </div>

                <div className="flex justify-between">
                    <Rb_Text variant="p">Delivery Charges</Rb_Text>
                    <Rb_Text variant="p">₹40</Rb_Text>
                </div>

                <div className="flex justify-between">
                    <Rb_Text variant="p">Tax (5%)</Rb_Text>
                    <Rb_Text variant="p">₹9</Rb_Text>
                </div>

            </div>

            <hr className="my-6" />

            <div className="mb-6 flex justify-between items-center">

                <Rb_Text variant="h4" className="font-bold">
                    Total Amount
                </Rb_Text>

                <Rb_Text variant="h4" className="font-bold">
                    ₹597
                </Rb_Text>

            </div>

            <Rb_Button className="w-full">
                Proceed to Checkout
            </Rb_Button>

        </div>
    );
}