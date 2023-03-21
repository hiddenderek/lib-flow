import { emitAction } from "src/flowActions/emitAction"

export const logError = async (reason: string, id: string, executionId: string, stateless: boolean, errors?: string) => {
    await emitAction(`flow.${id}.failed`, { reason, flowId: id, executionId, stateless })   
    console.info(`flow '${id}' failed. Reason: ${reason}.${errors ?  ` Errors: ${errors}.` : ''}`)  
}