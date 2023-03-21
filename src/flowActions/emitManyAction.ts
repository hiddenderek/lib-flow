import { JsonSchema } from "../types/jsonSchema"
import { Event } from "../types/event"
import { emitAction } from "./emitAction"
import { MetaParams } from "src/types/metaParams"

export const emitManyAction = async(events: Event[], meta?: MetaParams) => {
    for (let i = 0; i < events.length; i++) {
        await emitAction(events[i].name, events[i].payload, meta)
    }
}