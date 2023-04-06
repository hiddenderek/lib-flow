import { BaseFlowError } from "./BaseFlowError"

export class NotFoundError extends BaseFlowError {
    constructor(message: string, code: number, requestId: string, data: any) {
        super(
            message,
            "NotFoundError",
            code,
            requestId,
            data,
        )

    }
}