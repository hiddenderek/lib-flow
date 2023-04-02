import axios, { AxiosInstance } from "axios"
import { IClientDetails } from "../interfaces/IClientDetails"
import config from "../config"

export class FlowTestSuiteBuilder  {
    flowClient?: AxiosInstance
    flowId?: string
    baseURL: string
    executionId?: string
    status?: "completed" | "pending" | "failed" 
    responsePayload?: Record<string, any>

    constructor(flowClient?: AxiosInstance, flowId?: string) { 
       this.flowClient = flowClient
       this.flowId = flowId
       this.baseURL = process.env.API_GATEWAY_URL || `http://${config.host.hostname}:${config.host.port}`
    }
    public init = async (clientDetails: IClientDetails, flowId: string) : Promise<FlowTestSuiteBuilder>=> {
        // TODO: disable this placeholder-token and research authentication further
        const token = "placeholder-token"
        // const token: AxiosResponse<{access_token: string}> = await axios.post(
        //     `${this.baseURL}/v4/iam/oauth2/token`,
        //     clientDetails,
        //     {
        //         headers: {
        //             "Content-Type": 'application/json'
        //         }
        //     }
        // )
        console.log(this.baseURL)
        const axiosClient = axios.create({
            baseURL: this.baseURL,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        
        return new FlowTestSuiteBuilder(axiosClient, flowId)
    }

    public start = async (input: Record<string, any>) => {
        const result = await this.flowClient?.post(
            `v${config.flow.version}/flow/start/${this.flowId}`,
            input
        )
        this.executionId = result?.data?.id
        this.status = result?.data?.continuation?.status
        this.responsePayload = result?.data?.continuation?.result || result?.data?.continuation?.command
    }
    public resume = async (executionId: string, resumeWith: Record<string, any>) => {
        console.log(`PATH: v${config.flow.version}/flow/resume/${this.flowId}`)
        const result = await this.flowClient?.post(
            `v${config.flow.version}/flow/resume/${this.flowId}`,
            {executionId, resumeWith}
        )
        this.executionId = executionId
        this.status = result?.data?.continuation?.status
        this.responsePayload = result?.data?.continuation?.result || result?.data?.continuation?.command
    }
}