import { emitAction } from './flowActions/emit/emitAction';
import { IFlow } from './interfaces/IFlow';
import { JsonSchema } from './types/jsonSchema';
import { JsonSchemaToObject } from './types/jsonSchemaToObject'
import { validateFlowPolicy } from './flowChecks/validateFlowPolicy';
import { validateSchema } from "./flowChecks/validateSchema";
import { authenticateToken } from './flowAuth/authenticateToken';
import { logError } from './logging/logError';
import { actionHandler } from './flowActions/actionHandler';
import { logMessage } from './logging/logMessage';
import { v4 as uuidv4 } from 'uuid';
import LRUCache from 'lru-cache';
import { clonableIterator } from './utils/cloneableIterator';
import { IFlowSuccess } from './interfaces/IFlowSuccess';
import { IFlowFailure } from './interfaces/IFlowFailure';
import { IFlowLog } from './interfaces/IFlowLog';

export const flowRunner = async <I extends Readonly<JsonSchema>>(schema: JsonSchema , input: JsonSchemaToObject<I>, body: IFlow<I>['body'], id: string, executionSource: 'request' | 'queue' | 'cron', stateless: boolean, token: string, requestId: string, tenantId: string, cache: LRUCache<{}, {}, unknown>, flowMode?: 'start' | 'resume', resumeParams?: any): Promise<{ status: number, flowResult: IFlowSuccess | IFlowFailure}> => {
    const executionId = resumeParams?.executionId ? resumeParams.executionId : uuidv4()
    const flowSuccess : IFlowSuccess = {
        id: executionId,
        flowId: id,
        flowVersion: 2,
        tenantId,
        requestId,
        continuation: {
            status: 'pending'
        }
    }
    const flowFailure : IFlowFailure = {
        requestID : requestId,
        message: '',
        data: {},
        name: "BadRequestError",
        code: 400
    }
    const flowLog : IFlowLog = {
        id, 
        stateless, 
        executionId, 
        executionSource, 
        tenantId,
        requestId
    }
    try {
        // TODO: Figure out how to integrate with IAM roles and associated flow OPA policies
        // Right now just hard coded to an example rego policy
        const flowPolicyResult = await validateFlowPolicy(id)
        if (flowPolicyResult === false) {
            await logError("Not Found", flowLog) 
            flowFailure.message = `Flow ID ${id} not found`
            flowFailure.name = "NotFoundError"
            flowFailure.code = 404
            flowFailure.data = { flowId: id }
            return { status: 404, flowResult: flowFailure }
        }

        const userAuthResult = await authenticateToken(token)
        if (userAuthResult === 'Null') {
            await logError("Invalid Token.", flowLog) 
            flowFailure.message = "Invalid Token."
            flowFailure.name = "UnauthorizedError"
            flowFailure.code = 401
            flowFailure.data = { token }
            return { status: 401, flowResult: flowFailure }          
        } else if (userAuthResult === 'Error') {
            await logError("Authentication Errror", flowLog) 
            flowFailure.message = "Authentication Errror"
            flowFailure.name = "UnauthorizedError"
            flowFailure.code = 403
            flowFailure.data = { token }
            return { status: 403, flowResult: flowFailure }          
        }

        // No need to re validate main schema if resuming cached flow. AskFor schema will be evaluated in askForAction
        // this is so that we can get the value of the schema from the yield

        if (flowMode !== "resume") {
            const schemaResult = validateSchema(schema, input)
            if (schemaResult.valid === false) {
                await logError("Invalid input", flowLog, JSON.stringify(schemaResult.validate?.errors)) 
                flowFailure.message = "Invalid input"
                flowFailure.name = "BadRequestError"
                flowFailure.code = 422
                flowFailure.data = { errors:  schemaResult.validate?.errors}
                return { status: 422, flowResult: flowFailure }
            }  

            await emitAction({name: `flow.${id}.started`, payload: {flowId: id, executionId, requestId, stateless}})  
            logMessage(`flow '${id}' started`, flowLog)  
        } 
        

        // Run the body of the flow if all flow checks are successful
        const meta = {flowId: id, executionId, startTime: new Date().toISOString(), token, requestId, tenantId}

        const runTimeId = `${tenantId}.${id}.${executionId}`

        // check if there was a cached body instance before setting the body instance  

        let cachedInstance

        if (flowMode === "resume" && cache.has(runTimeId)) {
            await emitAction({name: `flow.resuming.cachedRuntime.${runTimeId}`, payload: {flowId: id, executionId, requestId, stateless}}) 
            cachedInstance = cache.get(runTimeId)! as any
            cache.delete(runTimeId)
            logMessage(`Initialized runtime (cache) in 0ms`, flowLog)  
        } else if (flowMode === "resume" && !cache.has(runTimeId)) {
            await logError("Cached flow instance not found", flowLog)
            flowFailure.message = "Cached flow instance not found"
            flowFailure.name = "NotFoundError"
            flowFailure.code = 404
            flowFailure.data = { flowId: id }
            return { status: 404, flowResult: flowFailure } 
        }   
        
        const bodyInstance = flowMode === "resume" && cachedInstance ? cachedInstance : clonableIterator(body([input, meta]))

        // if there is a cached instance and an input to resume with, modify the initial generator value to be the resume value

        let curVal: {value?: any; done?: boolean } = {value: cachedInstance && resumeParams?.resumeWith ? resumeParams.resumeWith : undefined, done: false};
        while(curVal?.done === false) {
            const cloneInstance = bodyInstance.clone()
            cache.set(runTimeId, cloneInstance)
            curVal = await bodyInstance.next(curVal.value)
            const actionName = curVal?.value?.__flowAction__
            // Make sure done is not true before executing an action. 
            // This is due to the potential to return an actions wrapper value at the end of a function,
            // Which contains the action name, and could trick the flow into 
            // thinking theres one last action to run when there is not
            if (actionName && curVal?.done !== true) {
                console.log("DONE STATUS: " + curVal.done)
                console.log("ACTION NAME: " + actionName)
                console.log("MODE BEFORE ACTION: " + flowMode)
                console.log('REQUEST ID ACTION' + meta.requestId)
                const actionResult = await actionHandler({curVal, meta, resumeWith: resumeParams?.resumeWith, flowMode})
                if (actionResult.status >= 400) {
                    await logError(`Error in action '${actionName}'`, flowLog, JSON.stringify(actionResult.data)) 
                    flowFailure.message = "Error in action"
                    flowFailure.name = "BadRequestError"
                    flowFailure.code = actionResult.status
                    flowFailure.data = actionResult.data ? actionResult.data : {}
                    return { status: actionResult.status, flowResult: flowFailure }
                } else if (actionResult.status === 202) {
                    flowSuccess.continuation.result = undefined
                    flowSuccess.continuation.status = "pending"
                    flowSuccess.continuation.command = { type: actionName, data: actionResult.data }
                    return { status: 202, flowResult: flowSuccess}
                }
            }
            // Resume mode only lasts for the first askFor flow action after a resume, then it reverts back to 'start' mode. 
            // This is to allow multiple resume requests in the same flow
            // if it was not reverted then the flow would not switch to pending again
            flowMode = "start"
            
            
        }

        await emitAction({name: `flow.${id}.completed`, payload: {flowId: id, executionId, requestId, stateless}})  
        logMessage(`flow '${id}' completed`, flowLog)
        // delete cache after flow is completed, this is to prevent endless repeats of the last cached step
        if (cache.has(runTimeId)) {
            cache.delete(runTimeId)
        }
        flowSuccess.continuation.command = undefined
        flowSuccess.continuation.status = "completed"
        flowSuccess.continuation.result = curVal.value
        return { status: curVal.value?.resStatus ? curVal.value.resStatus : 200, flowResult: flowSuccess}
    } catch (e: any) {
        await logError("Uncaught error in flow", flowLog, JSON.stringify(e)) 
        flowFailure.message = "Uncaught error in flow"
        flowFailure.name = "BadRequestError"
        flowFailure.code = 500
        flowFailure.data = e
        return { status: 500, flowResult: flowFailure}
    }
}