export interface IFlowFailure {
    requestID: string, 
    message: string, 
    data: Record<string, any>,
    name: "NotFoundError" | "BadRequestError" | "UnauthorizedError",
    code: number
}