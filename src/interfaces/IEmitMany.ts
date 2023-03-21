import { IEvent } from "./IEvent";
import { IMeta } from "./IMeta";

export interface IEmitMany {
    events: IEvent[],
    meta?: IMeta
}