import { JsonSchema } from "src/types/jsonSchema"
import { Event } from "../types/event"
import { emitAction } from "./emitAction"

export const emitManyAction = async(events: Event[]) => {
    const [input, meta] : [input: JsonSchema, meta: {token?: string}]= emitAction.caller.arguments[0]
    for (let i = 0; i < events.length; i++) {
        await emitAction(events[i].name, events[i].payload, meta?.token)
    }
}