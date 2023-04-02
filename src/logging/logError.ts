import { IFlowLog } from "../interfaces/IFlowLog"
import { emitAction } from "../flowActions/emit/emitAction"

export const logError = async (reason: string, flowLog : IFlowLog, errors?: string) => {
    const {id, executionId, executionSource, requestId, stateless} = flowLog
    await emitAction({name: `flow.${id}.failed`, payload: { reason, flowId: id, executionId, executionSource, requestId, stateless }})   
    console.info(`flow '${id}' failed. Reason: ${reason}.${errors ?  ` Errors: ${errors}.` : ''}`)  
}