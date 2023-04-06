import { emitAction } from "../emit/emitAction"
import { IEmitManyAction } from "../../interfaces/IEmitManyAction"
import { IFlowInfo } from "../../interfaces/IFlowInfo"
import { logMessage } from "../../logging/logMessage"

export const emitManyAction = async(options: IEmitManyAction) => {
    const flowInfo : IFlowInfo = {
        id: options.meta?.flowId,
        executionId: options.meta?.executionId, 
        tenantId: options.meta?.tenantId,
        requestId:  options.meta?.requestId,
        token: options.meta?.token,
        flowMode: options.meta?.flowMode
    }

    const eventAmount = options.events.length
    logMessage(`Emitting ${eventAmount} events for flow '${flowInfo.id}'`, flowInfo)

    for (let i = 0; i < eventAmount; i++) {
        await emitAction({name: options.events[i].name, payload: options.events[i].payload, type: options?.type, meta: options?.meta})
    }

    logMessage(`All ${eventAmount} events for flow '${flowInfo.id}' emitted succesfully`, flowInfo)
    return {status: 200, data: {}}
}