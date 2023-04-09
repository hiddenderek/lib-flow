import { error } from "../types/error";

export interface IFlowFailure {
    requestID?: string, 
    message: string, 
    data?: Record<string, any>,
    name: error,
    code: number,
    stack?: any
}