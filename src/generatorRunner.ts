import { emitAction } from './flowActions/emit';
import { flow } from './types/flow';
import { JsonSchema } from './types/jsonSchema';
import { JsonSchemaToObject } from './types/jsonSchemaToObject'
import { validateFlowPolicy } from './validateFlowPolicy';
import { validateSchema } from "./validateSchema";

export const generatorRunner = async <I extends Readonly<JsonSchema>>(schema: JsonSchema , input: JsonSchemaToObject<I>, body: flow<I>['body'], id: string, executionSource: 'request' | 'queue'): Promise<{data: any, status: number, id: string, executionId: string, executionSource: 'request' | 'queue'}> => {
    const executionId = Math.random().toString()
    try {
        await emitAction(`flow.${id}.started`, {})  
        console.info(`flow '${id}' started`)
        const schemaResult = validateSchema(schema, input)
        if (schemaResult.valid === false) {
            await emitAction(`flow.${id}.failed`, { reason: "Invalid Schema" })  
            console.info(`flow '${id}' failed. Reason: Invalid Schema. Errors: ${JSON.stringify(schemaResult.validate?.errors)}`)
            return {data: schemaResult.validate?.errors, status: 422, id, executionId, executionSource}
        }   
        const flowPolicyResult = await validateFlowPolicy(id)
        if (flowPolicyResult === false) {
            await emitAction(`flow.${id}.failed`, { reason: "Not Found" })   
            console.info(`flow '${id}' failed. Reason: Not Found.`)  
            return {data: {}, status: 404, id, executionId, executionSource}        
        }

        const bodyInstance = body([input, {flowId:id, executionId, startTime: new Date().toISOString()}])
        let curVal: {value?: any; done?: boolean } = {value: undefined, done: false};
        while(curVal?.done === false) {
            curVal = await bodyInstance.next(curVal.value)
        }
        await emitAction(`flow.${id}.completed`, {})  
        console.info(`flow '${id}' completed`)
        return {data: curVal.value, status: curVal.value?.resStatus ? curVal.value.resStatus : 200, id, executionId, executionSource};
    } catch (e) {
        await emitAction(`flow.${id}.failed`, { reason: "An Error Occured" })  
        console.info(`flow '${id}' failed. Reason: An error occurred. Errors: ${JSON.stringify(e)}`)
        return {data: e, status: 500, id, executionId, executionSource};
    }
}