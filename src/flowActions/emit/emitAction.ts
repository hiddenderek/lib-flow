import config from "../../config";
import amqp from 'amqplib';
import { v4 as uuid } from 'uuid';
import { IMeta } from "../../interfaces/IMeta";
import { logMessage } from "src/logging/logMessage";

export const emitAction = async (options: {name: string, payload: Record<string, any>, meta?: IMeta}) => {
    console.log('creating channel!')
    const connection = await amqp.connect(config.rabbitMQ.url)
    const channel = await connection.createChannel()
    const exchangeName = config.rabbitMQ.exchangeName
    const trackingId = uuid()
    await channel.assertExchange(exchangeName, "direct")

    await channel.publish(
        exchangeName,
        options.name,
        Buffer.from(
            JSON.stringify({
                logType: options.name,
                data: options.payload,
                timeStamp: new Date().toISOString(),
                token: options?.meta?.token,
                requestId: options?.meta?.requestId,
                trackingId
            })
        )
    )

    logMessage(`Publishing event with name ${options.name} (tracking id: ${trackingId}) to exchange ${exchangeName} with data: ${JSON.stringify(options.payload)}`)

    await channel.close()
}