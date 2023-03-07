import { Event } from "../types/event"
import { emitAction } from "./emit"

export const emitManyAction = async(events: Event[]) => {
    for (let i = 0; i < events.length; i++) {
        await emitAction(events[i].name, events[i].payload)
    }
}