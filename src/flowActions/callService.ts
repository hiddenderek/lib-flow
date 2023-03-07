import { AllowedRequests } from "../types/allowedRequests";
import { getAxiosClient } from "../flowAuth/getAxiosClient";

export const callServiceAction = async (name: string, params: {}, method: AllowedRequests) => {
    const axiosClient = await getAxiosClient()
    await axiosClient[method ? method : "post"](name, params)
}