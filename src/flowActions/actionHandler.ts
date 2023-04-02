import { IEmitAction } from "../interfaces/IEmitAction";
import { IEmitManyAction } from "../interfaces/IEmitManyAction";
import { IActionHandler } from "../interfaces/IActionHandler";
import { emitAction } from "./emit/emitAction";
import { emitManyAction } from "./emitMany/emitManyAction";
import { askForAction } from "./askFor/askForAction";
import { IAskForAction } from "../interfaces/IAskForAction";
import { logMessage } from "../logging/logMessage";
import { callServiceAction } from "./callService/callServiceAction";
import { IFlowLog } from "../interfaces/IFlowLog";
import { waitForEventAction } from "./waitForEvent/waitForEventAction";
import { IWaitForEventAction } from "../interfaces/IWaitForEventAction";
import { ICallServiceAction } from "../interfaces/ICallServiceAction";

export const actionHandler = async (input: IActionHandler) : Promise<{status: number, data: any}> => {
    const {__flowAction__, ...values} = JSON.parse(JSON.stringify(input.curVal.value)) as IActionHandler['curVal']['value']
    const flowLog : IFlowLog = {
        id: input.meta.flowId, 
        executionId: input.meta?.executionId, 
        tenantId: input.meta?.tenantId,
        requestId:  input.meta?.requestId,
    }
    logMessage(`Starting action '${__flowAction__}' for flow '${input.meta.flowId}'`, flowLog)
    switch (__flowAction__) {
        case 'emit': {
            const {status, data} = await emitAction({...values, meta: input.meta, type: "flow"} as IEmitAction)
            return {status, data}
        }
        case 'emitMany': {
            const {status, data} = await emitManyAction({...values, meta: input.meta, type: "flow"} as IEmitManyAction)
            return {status, data}
        }
        case 'callService': {
            const { status, data} = await callServiceAction({...values, meta: input.meta} as ICallServiceAction)
            return {status, data}
        }
        case 'askFor': {
            const {status, data} = await askForAction({...values, resumeWith: input?.resumeWith, flowMode: input.flowMode, curVal: input.curVal, meta: input.meta} as IAskForAction)
            return {status, data}
        }
        case 'waitForEvent': {
            const { status, data } = await waitForEventAction({...values, meta: input.meta, type: "flow"} as IWaitForEventAction)
            return {status, data}
        }
        default: {
            console.info('No supported action found')
            return {status: 404, data: {}}
        }
    }
}