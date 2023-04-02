import { IFlowLog } from "../interfaces/IFlowLog"

export const logMessage = (message: string, flowLog: IFlowLog) => {
    console.info(message)
}

