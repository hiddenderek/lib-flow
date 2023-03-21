import { IMeta } from "./IMeta";

export interface IEmitAction {
    name: string,
    payload: {[key: string]: any},
    meta?: IMeta
}