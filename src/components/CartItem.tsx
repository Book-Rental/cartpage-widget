import {
    Dropdown,
    Rb_Image,
    Rb_Icon,
    Rb_Text,
} from "rentbook-ui-lib";
import { CartItemType } from "../types/cart";
import { FaTrash } from "react-icons/fa";
interface Props {
    item: CartItemType;
}

export default function CartItem({ item }: Props) {
    return (
        <div className="flex items-center gap-6 rounded-xl border border-gray-200 bg-white p-6">

            <Rb_Image
                src={item.image}
                alt={item.title}
                width={100}
                height={100}

            />

            <div className="flex-1">
                <Rb_Text className="font-semibold text-lg">
                    {item.title}
                </Rb_Text>

                <Rb_Text className="text-gray-500 text-sm">
                    {item.author}
                </Rb_Text>
            </div>

            <div className="w-40">
                <Rb_Text variant="p" >Duration</Rb_Text>

                <Dropdown
                    value={item.duration}
                    onChange={(value) => console.log(value)}
                    options={[
                        { label: "15 Days", value: "15 Days" },
                        { label: "30 Days", value: "30 Days" },
                        { label: "45 Days", value: "45 Days" },
                    ]}
                />
            </div>

            <div className="text-right">
                <Rb_Text className="text-xl font-bold">
                    ₹{item.rentPrice}
                </Rb_Text>

                <Rb_Text variant="small">
                    ₹{item.deposit} Deposit
                </Rb_Text>
            </div>

            <Rb_Icon
                icon={FaTrash}
                className="cursor-pointer text-gray-500"
            />

        </div>
    );
}