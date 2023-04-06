import { executionSource } from "../types/executionSource"

export interface IFlowLog {
    mod: "Flow Output" | "Flow Runtime",
    flow: {
        id?: string, 
        executionId?: string, 
        executionSource?: executionSource, 
    },
    msg: string,
    error?: string,
    usr: {
        tenant: {id?: string},
    },
    token_id?: string,
    http: {
        requestId?: string,
        request_start_time: string,
        action: {
            name: string
        } | {}
    }
}