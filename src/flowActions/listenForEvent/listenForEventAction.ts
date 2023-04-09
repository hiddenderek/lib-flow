import config from "../../config"
import amqp from 'amqplib'
import { IListenForEventAction } from "../../interfaces/IListenForEventAction"
import { logMessage } from "../../logging/logMessage"
import { IFlowInfo } from "../../interfaces/IFlowInfo"

export const listenForEventAction = async (options: IListenForEventAction) => {
    const eventName = `track.${options.name}`
    
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
    const q = await channel.assertQueue(`${eventName}.WaitForEventQueue.${flowCheck ? "flow" : "test"}`)

    const flowLog : IFlowInfo = {
        id: options.meta?.flowId,
        executionId: options.meta?.executionId, 
        tenantId: options.meta?.tenantId,
        requestId:  options.meta?.requestId,
        token: options.meta?.token,
        flowMode: options.meta?.flowMode
    }

    logMessage(`Listening for event with name ${eventName}....`, flowLog)

    await channel.bindQueue(q.queue, config.rabbitMQ.exchangeName, eventName)
    await channel.close()
    await connection.close()
    return { status: 200, data: {}}
}