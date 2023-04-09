import { AllowedRequests } from "../types/allowedRequests"
import { JsonSchema } from "../types/jsonSchema"
import { JsonSchemaToObject } from "../types/jsonSchemaToObject"
import { IMeta } from "./IMeta"


export interface IFlow<I extends Readonly<JsonSchema>> {
    id: string,
    name: string,
    stateless: boolean,
    triggers?: {events?: string[], schedules?: string[]},
    method?: AllowedRequests,
    input?: I,
    body: ([input, meta]: [JsonSchemaToObject<I>, IMeta], ) => AsyncGenerator<any, any, any>
}


