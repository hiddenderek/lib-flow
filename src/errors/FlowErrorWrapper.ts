import { IMeta } from "../interfaces/IMeta";
import { BaseFlowError } from "./BaseFlowError"
type ErrorWithData = Error & { data: any };

export class FlowErrorWrapper extends BaseFlowError {
    constructor(data: string | Error | ErrorWithData | Record<string, any>, additionalData?: any, meta?: IMeta) {
        if (data instanceof Error) {
            super(
                data.message,
                "FlowError",
                500,
                meta?.requestId,
                (data as ErrorWithData)?.data,
                data.stack
            )
        } else if (typeof data === "string") {
            super(
                data,
                "FlowError",
                500,
                meta?.requestId,
                additionalData
            )
        } else if (typeof data === "object") {
            super(
                // TODO: Fix this, placeholder
                JSON.stringify(data),
                "FlowError",
                500,
                meta?.requestId,
                additionalData
            )            
        }
    }
}