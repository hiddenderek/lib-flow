import { IEvent } from "../../interfaces/IEvent"

export const emitManyWrapper = (events: IEvent[]) => {
    return {__flowAction__: 'emitMany', events}
}