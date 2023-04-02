import { emitAction } from "../emit/emitAction"
import { IEmitManyAction } from "../../interfaces/IEmitManyAction"

export const emitManyAction = async(options: IEmitManyAction) => {
    for (let i = 0; i < options.events.length; i++) {
        await emitAction({name: options.events[i].name, payload: options.events[i].payload, type: options?.type, meta: options?.meta})
    }
    return {status: 200, data: {}}
}