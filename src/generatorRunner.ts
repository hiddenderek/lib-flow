import { flow } from './types/flow';
import { JsonSchema, JsonSchemaToType } from './types/jsonSchemaToType';
import { validateSchema } from "./validateSchema";

export const generatorRunner = async <I extends Readonly<JsonSchema>>(schema: JsonSchema , input: JsonSchemaToType<I>, body: flow<I>['body'], id: string, executionSource: 'request' | 'queue'): Promise<{data: any, status: number, id: string, executionId: string, executionSource: 'request' | 'queue'}> => {
    const executionId = Math.random().toString()
    try {
        console.info('validate the schema!') 
        const result = validateSchema(schema, input)
        console.log(result)
        if (result.valid === false) {
            return {data: result.validate?.errors, status: 422, id, executionId, executionSource}
        }     
        console.info('run the body!')
        const bodyInstance = body([input, {flowId:id, executionId, startTime: new Date().toISOString()}])
        let curVal: {value?: any; done?: boolean } = {value: undefined, done: false};
        while(curVal?.done === false) {
            curVal = await bodyInstance.next(curVal.value)
        }
        return {data: curVal.value, status: 200, id, executionId, executionSource};
    } catch (e) {
        console.error(`Flow Error: ${JSON.stringify(e)}`)
        return {data: e, status: 500, id, executionId, executionSource};
    }
}