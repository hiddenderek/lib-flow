import { emitAction } from "../flowActions/emit/emitAction"

export const logError = async (reason: string, id: string, stateless: boolean,  executionId?: string, requestId?: string, errors?: string) => {
    await emitAction({name: `flow.${id}.failed`, payload: { reason, flowId: id, executionId, stateless }})   
    console.info(`flow '${id}' failed. Reason: ${reason}.${errors ?  ` Errors: ${errors}.` : ''}`)  
}