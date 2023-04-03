import { IMeta } from "./IMeta";

export interface IWaitForEventAction {
    name: string, 
    timeout?: number, 
    type?: "flow" | "test", 
    meta?: IMeta
}