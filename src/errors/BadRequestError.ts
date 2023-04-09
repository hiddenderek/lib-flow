import { BaseFlowError } from "./BaseFlowError"

export class BadRequestError extends BaseFlowError {
    constructor(message: string, code: number, requestId: string, data?: any) {
        super(
            message,
            "BadRequestError",
            code,
            requestId,
            data,
        )

    }
}