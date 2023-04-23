import { error } from "../types/error"

export class BaseFlowError extends Error {
    name: error
    requestID?: string
    code: number
    data?: any
    stack?: any
    constructor(message: string, errorType?: error, code?: number, requestId?: string, data?: any, stack?: any) {
        super(message)
        this.name = errorType ?? "FlowError"
        this.code = code ?? 500
        this.requestID = requestId
        this.data = data
        this.stack = stack
    }
}