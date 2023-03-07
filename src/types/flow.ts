import { AllowedRequests } from "./allowedRequests"
import { JsonSchema, JsonSchemaToType } from "./jsonSchemaToType"
import { MetaParams } from "./metaParams"


export interface flow<I extends Readonly<JsonSchema>> {
    id: string,
    name: string,
    stateless: boolean,
    triggers?: {events: string[]},
    method?: AllowedRequests,
    input: I,
    body: ([input, meta]: [JsonSchemaToType<I>, MetaParams], ) => AsyncGenerator<any, any>
}


