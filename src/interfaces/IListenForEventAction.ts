import { IMeta } from "./IMeta";

export interface IListenForEventAction {
    name: string, 
    type?: "flow" | "test", 
    meta?: IMeta
}