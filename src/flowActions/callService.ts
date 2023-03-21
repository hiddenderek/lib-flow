import { AllowedRequests } from "../types/allowedRequests";
import { getAxiosClient } from "../flowAuth/getAxiosClient";
import config from "../config";

export const callServiceAction = async (name: string, params: {}, method: AllowedRequests) => {
    const axiosClient = await getAxiosClient(config.flow.token)
    await axiosClient[method ? method : "post"](name, params)
}