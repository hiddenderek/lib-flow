export interface IMeta {
    flowId: string,
    executionId: string,
    requestId?: string,
    tenantId?: string,
    startTime: string,
    runTime?: string,
    token?: string,
    flowMode?: string,
    reqParams?: Record<string, any>
    reqQuery?: Record<string, any>
}