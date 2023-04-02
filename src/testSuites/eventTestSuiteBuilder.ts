import axios, { AxiosInstance, AxiosResponse } from "axios"
import { IClientDetails } from "../interfaces/IClientDetails"
import config from "../config"
import { waitForEventAction } from "../flowActions/waitForEvent/waitForEventAction"
import { emitAction } from "../flowActions/emit/emitAction"

export class EventTestSuiteBuilder  {
    flowClient : AxiosInstance | undefined
    flowId: string | undefined
    baseURL: string
    responsePayload : Record<string, any> | undefined

    constructor(flowClient?: AxiosInstance) { 
       this.flowClient = flowClient
       this.baseURL = process.env.API_GATEWAY_URL || `http://${config.host.hostname}:${config.host.port}`
    }
    public init = async (clientDetails: IClientDetails) : Promise<EventTestSuiteBuilder>=> {
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
        
        return new EventTestSuiteBuilder(axiosClient)
    }

    public waitForEvent = async (name: string, timeout?: number) => {
        const {status, data} = await waitForEventAction({name, timeout, type: "test"})
        return data
    }

    public emit = async (name: string, payload?: Record<string, any>) => {
        const {status, data} = await emitAction({name, payload, type: "test"})
        return data
    }
}