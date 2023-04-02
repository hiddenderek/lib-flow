export interface IFlowSuccess {
    id: string, 
    flowId: string, 
    flowVersion: number, 
    tenantId: string, 
    continuation: { 
        command?: Record<string, any>,
        status: 'completed' | 'pending' | 'failed',
        result?: Record<string, any>
    }
}