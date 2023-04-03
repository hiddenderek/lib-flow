import { JsonSchema } from "../types/jsonSchema"
import { IMeta } from "./IMeta"

export interface IAskForAction {
    schema: JsonSchema,
    resumeWith?: Record<string, any>,
    flowMode: string, 
    curVal: {
        done?: boolean,
        value: {
            __flowAction__: string, 
            [key:string] : any
        }
    },
    meta?: IMeta
}