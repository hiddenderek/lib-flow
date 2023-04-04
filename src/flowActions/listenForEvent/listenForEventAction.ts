import config from "../../config"
import amqp from 'amqplib'
import { logMessage } from "../../logging/logMessage"
import { IFlowLog } from "../../interfaces/IFlowLog"
import { IListenForEventAction } from "../../interfaces/IListenForEventAction"

export const listenForEventAction = async (options: IListenForEventAction) => {
    // TODO: Fix wait for event action (messages being acknowledged before waitForEvent can consume)
    const queueName = `track.${options.name}`
    console.info('listen!')
    console.log('waiting for event : ' + queueName)
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
    console.log('connected!')
    const channel = await connection.createChannel()
    await channel.assertExchange(config.rabbitMQ.exchangeName, "direct");
    const q = await channel.assertQueue(`${queueName}.WaitForEventQueue.${flowCheck ? "flow" : "test"}`)
    await channel.bindQueue(q.queue, config.rabbitMQ.exchangeName, queueName)
    await channel.close()
    await connection.close()
    return { status: 200, data: {}}
}