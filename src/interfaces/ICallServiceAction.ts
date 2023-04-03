import { AllowedRequests } from "../types/allowedRequests";

export interface ICallServiceAction {
    name: string, 
    params: {}, 
    method: AllowedRequests
}