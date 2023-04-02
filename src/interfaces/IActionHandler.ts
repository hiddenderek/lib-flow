import { IMeta } from "./IMeta"

export interface IActionHandler {
    curVal: {
        value?: any,
        done?: boolean
    },
    meta: IMeta,
    resumeWith: Record<string, any>,
    flowMode?: string,
}