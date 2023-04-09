import { IMeta } from "./IMeta";

export interface IEmitAction {
    name: string,
    payload?: {[key: string]: any},
    type?: "flow" | "test", 
    tracked?: boolean,
    meta?: IMeta
}