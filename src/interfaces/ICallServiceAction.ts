import { AllowedRequests } from "../types/allowedRequests";
import { IMeta } from "./IMeta";

export interface ICallServiceAction {
    name: string, 
    params: {}, 
    method: AllowedRequests,
    meta: IMeta
}