import { AllowedRequests } from "../../types/allowedRequests";

export const callServiceWrapper = async (name: string, params: {}, method?: AllowedRequests) => {
    return {__flowAction__: 'callService', name, params, method}
}