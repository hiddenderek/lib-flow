import axios, { AxiosInstance, AxiosResponse } from "axios"
import { IClientDetails } from "../interfaces/IClientDetails"
import config from "../config"
import { waitForEventAction } from "../flowActions/waitForEvent/waitForEventAction"
import { emitAction } from "../flowActions/emit/emitAction"
import { v4 as uuidv4 } from 'uuid';
import { IMeta } from "src/interfaces/IMeta"

export class EventTestSuiteBuilder  {
    flowClient?: AxiosInstance
    flowId?: string
    baseURL: string
    responsePayload?: Record<string, any>
    fakeMeta?: IMeta

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

    public waitForEvent = async (name: string, timeout?: number, requestId?: string) => {
        const {status, data} = await waitForEventAction({name, timeout, type: "test", meta: this.fakeMeta ?? {requestId} as any})
        return data
    }

    public emit = async (name: string, payload?: Record<string, any>) => {
        const fakeMeta =  {
            flowId: 'test-flow',
            requestId: uuidv4(),
            tenantId: process?.env?.CLIENT_TENANT || 'nelnet',
            executionId: uuidv4(),
            startTime: 'fake-time'
        }
        this.fakeMeta = fakeMeta
        const {status, data} = await emitAction({name, payload, type: "test", meta: this.fakeMeta})
        return data
    }
}