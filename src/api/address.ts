import axios from "axios";
import { endpoints } from "./api";

export const validateAddress = async (pincode: string) => {
    const response = await axios.post(
        endpoints.validateAddress,
        {
            pincode,
        },
        {
            withCredentials: true,
        }
    );

    return response.data;
};