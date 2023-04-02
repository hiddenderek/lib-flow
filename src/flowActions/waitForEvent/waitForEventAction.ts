import config from "../../config"
import amqp from 'amqplib'
import { logMessage } from "../../logging/logMessage"
import { IFlowLog } from "../../interfaces/IFlowLog"
import { IWaitForEventAction } from "../../interfaces/IWaitForEventAction"

export const waitForEventAction = async (options: IWaitForEventAction) => {
    console.info('listen!')
    const flowCheck = options.type === "flow"  || options.type === undefined
    let connection : amqp.Connection
    const url = flowCheck ? config.rabbitMQ.url : config.rabbitMQ.testUrl
    try {
    connection = await amqp.connect(url)
    } catch (e) {
        console.info('retry!')
        await new Promise(resolve => setTimeout(resolve, 1000));
        connection = await amqp.connect(url)
    }
    const channel = await connection.createChannel()
    await channel.assertExchange(config.rabbitMQ.exchangeName, "direct");
    const q = await channel.assertQueue(`${options.name}${flowCheck ? "WaitForEvent" : "TestWaitForEvent"} Queue`)
    await channel.bindQueue(q.queue, config.rabbitMQ.exchangeName, options.name)
    const timeoutDuration = options.timeout ?? 5000
    let timeout : NodeJS.Timeout | undefined
    const message : any = await new Promise((resolve, reject) => {
        const flowLog : IFlowLog = {
            id: options.meta?.flowId,
            executionId: options.meta?.executionId, 
            tenantId: options.meta?.tenantId,
            requestId:  options.meta?.requestId,
        }
        flowCheck ? logMessage(`Waiting for event '${options.name}'`, flowLog) : "";

        timeout = setTimeout(async () => {
            await channel.deleteQueue(options.name)
            await channel.close()
            await connection.close()
            reject(new Error (`timed out waiting for event '${options.name}' in ${timeoutDuration}ms`))
        }, timeoutDuration)

        channel.consume(q.queue, async (msg) => {
                if (msg) {
                    const payload =JSON.parse(msg.content.toString())
                    // only allow waitForEvents to be successful if the event requestId matches the current one
                    // this is to avoid clutter with other events
                    // dont outright reject though as there could be multiple events from multiple requests being consumed by the waitForEvent
                    if ((options.meta?.requestId === payload?.requestId) || !flowCheck) {
                        clearTimeout(timeout)
                        flowCheck ? logMessage(`Consumed event '${options.name}'`, flowLog) : ""
                        resolve({name: payload.logType, payload: payload.data});
                    } 
                }
            }
        )
    }) 

    // dont acknowledge message as this is just a check to make sure it was emitted
    await channel.deleteQueue(options.name)
    await channel.close()
    await connection.close()
    clearTimeout(timeout)
    if (message && !message.reason) {
        return { status: 200, data: message}
    } else {
        return { status: 500, data: message.reason}
    }
}