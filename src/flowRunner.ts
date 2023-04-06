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
import { IFlowInfo } from './interfaces/IFlowInfo';
import { decorateLog } from './logging/decorateLog';
import { UnauthorizedError } from './errors/UnauthorizedError';
import { BadRequestError } from './errors/BadRequestError';
import { NotFoundError } from './errors/NotFoundError';
import { FlowCommandFailedError } from './errors/FlowCommandFailedError';

export const flowRunner = async <I extends Readonly<JsonSchema>>(schema: JsonSchema , input: JsonSchemaToObject<I>, body: IFlow<I>['body'], id: string, executionSource: 'request' | 'queue' | 'cron', stateless: boolean, token: string, requestId: string, tenantId: string, cache: LRUCache<{}, {}, unknown>, flowMode?: 'start' | 'resume', resumeParams?: any): Promise<{ status: number, flowResult: IFlowSuccess | IFlowFailure}> => {
    const executionId = resumeParams?.executionId ? resumeParams.executionId : uuidv4() 
    const flowInfo : IFlowInfo = {
        id, 
        stateless, 
        executionId, 
        executionSource, 
        tenantId,
        requestId,
        token,
        flowMode
    }
    try {
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

            // TODO: Figure out how to integrate with IAM roles and associated flow OPA policies
            // Right now just hard coded to an example rego policy
            const flowPolicyResult = await validateFlowPolicy(id)
            if (flowPolicyResult === false) {
                const message = "NotFound"
                const status = 404
                await logError(message, flowInfo) 
                const error = new NotFoundError(message, status, requestId, { flowId: id })
                return {status: status, flowResult: error}
            }

            const userAuthResult = await authenticateToken(token)
            if (userAuthResult === 'Null') {
                const message = "Invalid Token"
                const status = 401
                const error = new UnauthorizedError(message, status, requestId, { token })
                await logError(message, flowInfo) 
                return {status: status, flowResult: error} 
            } else if (userAuthResult === 'Error') {
                const message = "Authentication Error"
                const status = 403
                const error = new UnauthorizedError(message, status, requestId, { token })
                await logError(message, flowInfo) 
                return {status: status, flowResult: error}    
            }

            // No need to re validate main schema if resuming cached flow. AskFor schema will be evaluated in askForAction
            // this is so that we can get the value of the schema from the yield

            if (flowMode !== "resume") {
                const schemaResult = validateSchema(schema, input)
                if (schemaResult.valid === false) {
                    const message = "Invalid input"
                    const status = 422
                    await logError(message, flowInfo, JSON.stringify(schemaResult.validate?.errors)) 
                    const error = new BadRequestError(message, status, requestId, schemaResult.validate?.errors)
                    return {status: status, flowResult: error}
                }  

                await emitAction({name: `flow.${id}.started`, payload: {flowId: id, executionId, requestId, stateless}})  
                logMessage(`flow '${id}' started`, flowInfo)  
            } 
            

            // Run the body of the flow if all flow checks are successful

            const runTimeId = `${tenantId}.${id}.${executionId}`

            const meta = {flowId: id, executionId, startTime: new Date().toISOString(), token, requestId, tenantId}

            // check if there was a cached body instance before setting the body instance  

            let cachedInstance

            if (flowMode === "resume" && cache.has(runTimeId)) {
                await emitAction({name: `flow.resuming.cachedRuntime.${runTimeId}`, payload: {flowId: id, executionId, requestId, stateless}}) 
                cachedInstance = cache.get(runTimeId)! as any
                cache.delete(runTimeId)
                logMessage(`Initialized runtime (cache) in 0ms`, flowInfo)  
            } else if (flowMode === "resume" && !cache.has(runTimeId)) {
                const message = "Cached flow instance not found"
                const status = 404
                await logError(message, flowInfo) 
                const error = new NotFoundError(message, status, requestId, { flowId: id })
                return {status: status, flowResult: error}
            }   
            
            const bodyInstance = flowMode === "resume" && cachedInstance ? cachedInstance : clonableIterator(body([input, meta]))

            // if there is a cached instance and an input to resume with, modify the initial generator value to be the resume value

            let curVal: {value?: any; done?: boolean } = {value: cachedInstance && resumeParams?.resumeWith ? resumeParams.resumeWith : undefined, done: false};

            // as the actual body of the flow is about to start running, we will override console outputs to print debuggable info along with the message

            decorateLog(flowInfo, "Flow Output")
            try {
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
                        const actionResult = await actionHandler({curVal, meta, resumeWith: resumeParams?.resumeWith, flowMode})
                        if (actionResult.status >= 400) {
                            const message = `Error in action '${actionName}'`
                            const status = actionResult.status
                            await logError(message, flowInfo, JSON.stringify(actionResult.data)) 
                            const error = new FlowCommandFailedError(message, status, requestId, actionResult.data)
                            return {status: status, flowResult: error}
                        } else if (actionResult.status === 202) {
                            flowSuccess.continuation.result = undefined
                            flowSuccess.continuation.status = "pending"
                            flowSuccess.continuation.command = { type: actionName, data: actionResult.data }
                            return { status: 202, flowResult: flowSuccess}
                        }
                        logMessage(`Action '${actionName}' for flow '${id}' completed successfully`, flowInfo)
                    }
                    // Resume mode only lasts for the first askFor flow action after a resume, then it reverts back to 'start' mode. 
                    // This is to allow multiple resume requests in the same flow
                    // if it was not reverted then the flow would not switch to pending again
                    flowMode = "start"
                }
            } catch (e: any) {
                const message = "Uncaught error in flow"
                const status = 500
                await logError(message, flowInfo, e, "Flow Output") 
                const error = new BadRequestError(message, status, requestId, {...e, message: e.message})
                return {status: status, flowResult: error}
            }

            await emitAction({name: `flow.${id}.completed`, payload: {flowId: id, executionId, requestId, stateless}})  
            logMessage(`flow '${id}' completed`, flowInfo)
            // delete cache after flow is completed, this is to prevent endless repeats of the last cached step
            if (cache.has(runTimeId)) {
                cache.delete(runTimeId)
            }
            flowSuccess.continuation.command = undefined
            flowSuccess.continuation.status = "completed"
            flowSuccess.continuation.result = curVal.value
            return { status: curVal.value?.resStatus ? curVal.value.resStatus : 200, flowResult: flowSuccess}
    } catch (e: any) {
        const message = "Unknown error"
        const status = 500
        await logError(message, flowInfo, e) 
        const error = new BadRequestError(message, status, requestId, e)
        return {status: status, flowResult: error}
    }
}