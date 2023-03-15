import Ajv from "ajv"
import { JsonSchema, JsonSchemaToType } from "./types/jsonSchema"

export const validateSchema = (schema: JsonSchema, input: JsonSchemaToType<JsonSchema>) => {
    const ajv = new Ajv()
    const validate = ajv.compile(schema)
    const valid = validate(input)
    return {valid, validate}
}