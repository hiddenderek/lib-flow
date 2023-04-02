import { JsonSchema } from "../../types/jsonSchema"

export const askForWrapper = (schema: JsonSchema, errors?: string[]) => {
    return {__flowAction__: 'askFor', schema}
}