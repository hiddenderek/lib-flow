import { BaseFlowError } from "./BaseFlowError"

export class UnauthorizedError extends BaseFlowError {
    constructor(message: string, code: number, requestId: string, data: any) {
        super(
            message,
            "UnauthorizedError",
            code,
            requestId,
            data,
        )

    }
}