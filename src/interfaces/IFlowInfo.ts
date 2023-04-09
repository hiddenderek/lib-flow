import { executionSource } from "../types/executionSource";

export interface IFlowInfo {
    id?: string, 
    stateless?: boolean, 
    executionId?: string, 
    executionSource?: executionSource, 
    tenantId?: string,
    requestId?: string,
    token?: string,
    version?: number,
    flowMode?: string
    
}