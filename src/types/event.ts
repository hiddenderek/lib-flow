import { JsonSchema, JsonSchemaToType } from "./jsonSchemaToType";

export type Event = {name: string, payload: JsonSchemaToType<JsonSchema>}