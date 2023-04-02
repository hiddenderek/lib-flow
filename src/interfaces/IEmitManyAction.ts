import { IEvent } from "./IEvent";
import { IMeta } from "./IMeta";

export interface IEmitManyAction {
    events: IEvent[],
    type: "flow" | "test",
    meta?: IMeta
}