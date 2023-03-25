import { emitAction } from './flowActions/emit/emitAction';
import { IFlow } from './interfaces/IFlow';
import { JsonSchema } from './types/jsonSchema';
import { JsonSchemaToObject } from './types/jsonSchemaToObject'
import { validateFlowPolicy } from './flowChecks/validateFlowPolicy';
import { validateSchema } from "./flowChecks/validateSchema";
import { authenticateToken } from './flowAuth/authenticateToken';
import { logError } from './errors/logError';
import { actionHandler } from './flowActions/actionHandler';
import { logMessage } from './logging/logMessage';

export const flowRunner = async <I extends Readonly<JsonSchema>>(schema: JsonSchema , input: JsonSchemaToObject<I>, body: IFlow<I>['body'], id: string, executionSource: 'request' | 'queue' | 'cron', stateless: boolean, token?: string, requestId?: string): Promise<{data: any, status: number, id: string, executionId: string, executionSource: 'request' | 'queue' | 'cron', requestId?: string}> => {
    const executionId = Math.random().toString()
    try {
        await emitAction({name: `flow.${id}.started`, payload: {flowId: id, executionId, requestId, stateless}})  
        logMessage(`flow '${id}' started`)

        const flowPolicyResult = await validateFlowPolicy(id)
        if (flowPolicyResult === false) {
            await logError("Not Found", id, stateless, executionId, requestId) 
            return {data: {}, status: 404, id, executionId, requestId, executionSource}        
        }

        const userAuthResult = await authenticateToken(token)
        if (userAuthResult === 'Null') {
            await logError("Null Authenticate", id, stateless, executionId, requestId) 
            return {data: {}, status: 401, id, executionId, requestId, executionSource}            
        } else if (userAuthResult === 'Error') {
            await logError("Authentication Errror", id, stateless, executionId, requestId) 
            return {data: {}, status: 403, id, executionId, requestId, executionSource}            
        }

        const schemaResult = validateSchema(schema, input)
        if (schemaResult.valid === false) {
            await logError("Invalid Schema", id, stateless, executionId, requestId, JSON.stringify(schemaResult.validate?.errors)) 
            return {data: schemaResult.validate?.errors, status: 422, id, executionId, requestId, executionSource}
        }   

        // Run the body of the flow if all flow checks are successful
        const meta = {flowId: id, executionId, startTime: new Date().toISOString(), token, requestId}
        const bodyInstance = body([input, meta])
        let curVal: {value?: any; done?: boolean } = {value: undefined, done: false};
        while(curVal?.done === false) {
            curVal = await bodyInstance.next(curVal.value)
            console.log(curVal.value)
            if (curVal?.value?.__flowAction__) {
                await actionHandler({...curVal?.value, meta})
            }
        }

        await emitAction({name: `flow.${id}.completed`, payload: {flowId: id, executionId, requestId, stateless}})  
        logMessage(`flow '${id}' completed`)
        return {data: curVal.value, status: curVal.value?.resStatus ? curVal.value.resStatus : 200, id, executionId, requestId, executionSource};
    } catch (e) {
        await logError("Internal Server Error", id, stateless, executionId, requestId, JSON.stringify(e)) 
        return {data: e, status: 500, id, executionId, requestId,  executionSource};
    }
}