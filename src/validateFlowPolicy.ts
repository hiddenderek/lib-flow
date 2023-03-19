import axios, { AxiosResponse } from "axios"
import config from "./config"

export async function validateFlowPolicy(flowId: string): Promise<boolean> {
    const result: AxiosResponse<{result: boolean}> = await axios.post(
        `${config.opa.url}/v1/data/policy/allow`,
        {
            input:{
                request: {
                    params: {
                        flowId
                    }
                }
            }
        }
    )
    return result.data.result
}