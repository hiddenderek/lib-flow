import { BaseFlowError } from "./BaseFlowError"

export class FlowCommandFailedError extends BaseFlowError {
    constructor(message: string, code: number, requestId: string, data: any) {
        super(
            message,
            "FlowCommandFailedError",
            code,
            requestId,
            data,
        )
    }
}