
import { AxiosError } from "axios";
import { ICallServiceAction } from "../../interfaces/ICallServiceAction";
import { getAxiosClient } from "../../flowAuth/getAxiosClient";
import { IFlowInfo } from "../../interfaces/IFlowInfo";
import { logMessage } from "../../logging/logMessage";

export const callServiceAction = async (options: ICallServiceAction) => {
    const flowInfo: IFlowInfo = {
        id: options.meta?.flowId,
        executionId: options.meta?.executionId,
        tenantId: options.meta?.tenantId,
        requestId: options.meta?.requestId,
    }
    try {
        const nameFormat = options.name.split('.').join('/')
        logMessage(`Starting CallService request for '${nameFormat}' with data ${JSON.stringify(options.params)}`, flowInfo)
        const axiosClient = await getAxiosClient(options.meta?.token)
        const result = await axiosClient[options.method ? options.method : "post"](nameFormat, options.params)
        return { status: 200, data: result?.data }
    } catch (e) {
        console.log(e)
        const error = e as AxiosError
        return { status: 500, data: error.response?.data }
    }
}