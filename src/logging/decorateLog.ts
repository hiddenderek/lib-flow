import { IFlowLog } from "../interfaces/IFlowLog"
import config from "../config"
import { IFlowInfo } from "../interfaces/IFlowInfo"

export function decorateLog(flowInfo: IFlowInfo, logType: "Flow Output" | "Flow Runtime", error?: any) {
    const {id, executionId, executionSource, tenantId, token, requestId, version, flowMode} = flowInfo 
    const replaceLog = (message: string) => {
        const flowLog : IFlowLog = {
            mod: logType,
            flow: {
                id, 
                executionId, 
                executionSource, 
            },
            msg: message,
            error,
            usr: {
                tenant: {id: tenantId},
            },
            token_id: token,
            http: {
                requestId,
                request_start_time: new Date().toISOString(),
                action: flowMode ? {
                    name: `v${config.flow.version}.flow.${flowMode}`
                } : {}
            }
        }
        process.stdout.write(`${JSON.stringify(flowLog)}\r\n`)
    }
    console.log = replaceLog
    console.info = replaceLog
    console.error = replaceLog
}