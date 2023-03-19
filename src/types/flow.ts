import { AllowedRequests } from "./allowedRequests"
import { JsonSchema } from "./jsonSchema"
import { JsonSchemaToObject } from "./jsonSchemaToObject"
import { MetaParams } from "./metaParams"


export interface flow<I extends Readonly<JsonSchema>> {
    id: string,
    name: string,
    stateless: boolean,
    triggers?: {events: string[]},
    method?: AllowedRequests,
    input: I,
    body: ([input, meta]: [JsonSchemaToObject<I>, MetaParams], ) => AsyncGenerator<any, any>
}


