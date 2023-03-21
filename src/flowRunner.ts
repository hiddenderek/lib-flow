import { emitAction } from './flowActions/emit/emitAction';
import { IFlow } from './interfaces/IFlow';
import { JsonSchema } from './types/jsonSchema';
import { JsonSchemaToObject } from './types/jsonSchemaToObject'
import { validateFlowPolicy } from './flowChecks/validateFlowPolicy';
import { validateSchema } from "./flowChecks/validateSchema";
import { authenticateToken } from './flowChecks/authenticateToken';
import { logError } from './errors/logError';
import { actionHandler } from './flowActions/actionHandler';

export const flowRunner = async <I extends Readonly<JsonSchema>>(schema: JsonSchema , input: JsonSchemaToObject<I>, body: IFlow<I>['body'], id: string, executionSource: 'request' | 'queue', stateless: boolean, token?: string): Promise<{data: any, status: number, id: string, executionId: string, executionSource: 'request' | 'queue'}> => {
    const executionId = Math.random().toString()
    try {
        await emitAction({name: `flow.${id}.started`, payload: {flowId: id, executionId, stateless}})  
        console.info(`flow '${id}' started`)

        const flowPolicyResult = await validateFlowPolicy(id)
        if (flowPolicyResult === false) {
            await logError("Not Found", id, executionId, stateless) 
            return {data: {}, status: 404, id, executionId, executionSource}        
        }

        const userAuthResult = await authenticateToken(token)
        if (userAuthResult === 'Null') {
            await logError("Null Authenticate", id, executionId, stateless) 
            return {data: {}, status: 401, id, executionId, executionSource}            
        } else if (userAuthResult === 'Error') {
            await logError("Authentication Errror", id, executionId, stateless) 
            return {data: {}, status: 403, id, executionId, executionSource}            
        }

        const schemaResult = validateSchema(schema, input)
        if (schemaResult.valid === false) {
            await logError("Invalid Schema", id, executionId, stateless, JSON.stringify(schemaResult.validate?.errors)) 
            return {data: schemaResult.validate?.errors, status: 422, id, executionId, executionSource}
        }   

        // Run the body of the flow if all flow checks are successful
        const meta= {flowId: id, executionId, startTime: new Date().toISOString(), token}
        const bodyInstance = body([input, meta])
        let curVal: {value?: any; done?: boolean } = {value: undefined, done: false};
        while(curVal?.done === false) {
            curVal = await bodyInstance.next(curVal.value)
            console.log(curVal.value)
            if (curVal?.value?.__flowAction__) {
                await actionHandler({...curVal?.value, meta})
            }
        }

        await emitAction({name: `flow.${id}.completed`, payload: {flowId: id, executionId, stateless}})  
        console.info(`flow '${id}' completed`)
        return {data: curVal.value, status: curVal.value?.resStatus ? curVal.value.resStatus : 200, id, executionId, executionSource};
    } catch (e) {
        await logError("Internal Server Error", id, executionId, stateless, JSON.stringify(e)) 
        return {data: e, status: 500, id, executionId, executionSource};
    }
}