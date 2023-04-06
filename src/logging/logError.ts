import { IFlowInfo } from "../interfaces/IFlowInfo"
import { emitAction } from "../flowActions/emit/emitAction"
import { decorateLog } from "./decorateLog"

export const logError = async (reason: string, flowLog : IFlowInfo, error?: string, errorContext?: "Flow Runtime" | "Flow Output") => {
    const {id, executionId, executionSource, requestId, stateless} = flowLog
    await emitAction({name: `flow.${id}.failed`, payload: { reason, flowId: id, executionId, executionSource, requestId, stateless }})   
    decorateLog(flowLog, errorContext ??  "Flow Runtime", error)
    console.error(`Uncaught error in flow.`)  
}