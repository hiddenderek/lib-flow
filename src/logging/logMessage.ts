import { decorateLog } from "./decorateLog"
import { IFlowInfo } from "../interfaces/IFlowInfo"

export const logMessage = (message: string, flowLog: IFlowInfo) => {
    decorateLog(flowLog, "Flow Runtime")
    console.log(message)
}

