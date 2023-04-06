
import { AxiosError } from "axios";
import { ICallServiceAction } from "../../interfaces/ICallServiceAction";
import { getAxiosClient } from "../../flowAuth/getAxiosClient";
import { IFlowInfo } from "../../interfaces/IFlowInfo";
import { logMessage } from "../../logging/logMessage";

export const callServiceAction = async (options: ICallServiceAction)  => {
    const flowInfo : IFlowInfo = {
        id: options.meta?.flowId,
        executionId: options.meta?.executionId, 
        tenantId: options.meta?.tenantId,
        requestId:  options.meta?.requestId,
        token: options.meta?.token,
    }
    try {
        logMessage(`Starting CallService request for '${options.name}'`, flowInfo) 
        const axiosClient = await getAxiosClient()
        const nameFormat = options.name.replace('.', '/')
        await axiosClient[options.method ? options.method : "post"](nameFormat, options.params)
        return {status: 200, data: {}}
    } catch (e) {
        const error = e as AxiosError
        return {status: 500, data: error.response?.data}
    }
}