import { IEvent } from "../../interfaces/IEvent"
import { emitAction } from "../emit/emitAction"
import { IMeta } from "../../interfaces/IMeta"

export const emitManyAction = async(options: {events: IEvent[], meta?: IMeta}) => {
    for (let i = 0; i < options.events.length; i++) {
        await emitAction({name: options.events[i].name, payload: options.events[i].payload, meta: options?.meta})
    }
}