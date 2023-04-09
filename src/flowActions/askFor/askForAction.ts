import { logMessage } from "../../logging/logMessage"
import { IAskForAction } from "../../interfaces/IAskForAction"
import { validateSchema } from "../../flowChecks/validateSchema"
import { IFlowInfo } from "../../interfaces/IFlowInfo"

export const askForAction = async(options: IAskForAction) : Promise<{status: number, data: Record<string, any> | undefined | null}>=> {
    const flowInfo : IFlowInfo = {
        id: options.meta?.flowId,
        executionId: options.meta?.executionId, 
        tenantId: options.meta?.tenantId,
        requestId:  options.meta?.requestId,
        token: options.meta?.token,
        flowMode: options?.flowMode
    }
    if (options.flowMode !== "resume") {
       // artificially stop flow execution 
       // make sure done is set to undefined to prevent confusion with truly done status
       // actual done status should only be set to true naturally
       options.curVal.done = undefined
       logMessage(`Flow '${options.meta?.flowId}' paused with 'askFor' action. Waiting for resume...`, flowInfo)   
       return {status: 202, data: {schema: options.schema}}
    } else if (options.flowMode === "resume" && options.resumeWith) {
        logMessage(`Resuming flow '${options.meta?.flowId}'with 'askFor' action.`, flowInfo)   
        // if we are resuming, authenticate the resumeWith content
        const schema = options.schema
        const resumeWith = options.resumeWith
        const schemaResult = validateSchema(schema, resumeWith)
        if (schemaResult.valid) {
            logMessage(`Flow '${options.meta?.flowId}' resumed with 'askFor' action. Resume data: ${JSON.stringify(resumeWith)}`, flowInfo)   
            // continue flow execution
            options.curVal.done = false
            return {status: 200, data: {}}
        } else {
            return {status: 422, data: schemaResult.validate?.errors}
        }
    } else {
        logMessage(`Flow '${options.meta?.flowId}' has no resumeWith input for an 'askFor' action`, flowInfo)   
        return {status: 422, data: { Errors: "No resumeWith input provided"}}
    }
}