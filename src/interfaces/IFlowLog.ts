import { executionSource } from "../types/executionSource";

export interface IFlowLog {
    id?: string, 
    stateless?: boolean, 
    executionId?: string, 
    executionSource?: executionSource, 
    tenantId?: string,
    requestId?: string
}