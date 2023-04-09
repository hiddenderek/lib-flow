import Ajv from "ajv"
import { JsonSchema } from "../types/jsonSchema"
import { JsonSchemaToObject } from "../types/jsonSchemaToObject"

export const validateSchema = (schema: JsonSchema, input: JsonSchemaToObject<JsonSchema>) => {
    if (schema) {
        const ajv = new Ajv()
        const validate = ajv.compile(schema)
        const valid = validate(input)
        return {valid, validate}
    } else {
        return {valid: true}
    }
}