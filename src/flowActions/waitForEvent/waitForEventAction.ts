import config from "../../config"
import amqp from 'amqplib'
import { logMessage } from "../../logging/logMessage"
import { IFlowInfo } from "../../interfaces/IFlowInfo"
import { IWaitForEventAction } from "../../interfaces/IWaitForEventAction"

export const waitForEventAction = async (options: IWaitForEventAction) => {
    const queueName = `track.${options.name}`
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
    const q = await channel.assertQueue(`${queueName}.WaitForEventQueue.${flowCheck ? "flow" : "test"}`)
    await channel.bindQueue(q.queue, config.rabbitMQ.exchangeName, queueName)
    const timeoutDuration = options.timeout ?? 7000
    let timeout : NodeJS.Timeout | undefined
    const message : any = await new Promise((resolve, reject) => {
        const flowInfo : IFlowInfo = {
            id: options.meta?.flowId,
            executionId: options.meta?.executionId, 
            tenantId: options.meta?.tenantId,
            requestId:  options.meta?.requestId,
            token: options.meta?.token,
            flowMode: options.meta?.flowMode
        }

        logMessage(`Waiting for event '${queueName}' with requestId '${flowInfo.requestId}'...`, flowInfo)

        timeout = setTimeout(async () => {
            await channel.deleteQueue(queueName)
            await channel.close()
            await connection.close()
            reject(new Error (`timed out waiting for event '${queueName}' in ${timeoutDuration}ms`))
        }, timeoutDuration)

        channel.consume(q.queue, async (msg) => {
                if (msg) {
                    const payload =JSON.parse(msg.content.toString())
                    // only allow waitForEvents to be successful if the event requestId matches the current one
                    // this is to avoid clutter with other events
                    // dont outright reject though as there could be multiple events from multiple requests being consumed by the waitForEvent
                    const requestIdCheck = flowInfo.requestId === payload?.requestId
                    logMessage(`Consuming tracked event '${queueName}'. RequestId match: ${requestIdCheck}. Original requestId: '${flowInfo.requestId}', Payload requestId: '${payload?.requestId}'.`, flowInfo)
                    if (requestIdCheck) {
                        clearTimeout(timeout)
                        channel.ack(msg)
                        logMessage(`Consumed tracked event '${queueName}' with requestId '${payload?.requestId}'`, flowInfo)
                        resolve({name: payload.logType, payload: payload.data});
                    } 
                }
            }
        )
    }) 
    await channel.deleteQueue(queueName)
    await channel.close()
    await connection.close()
    clearTimeout(timeout)
    if (message && !message.reason) {
        return { status: 200, data: message}
    } else {
        return { status: 500, data: message.reason}
    }
}