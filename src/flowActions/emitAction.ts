import config from "../config";
import amqp from 'amqplib';
import { v4 as uuid } from 'uuid';
import { MetaParams } from "src/types/metaParams";

export const emitAction = async (name: string, payload: Record<string, any>, meta?: MetaParams) => {
    console.log('creating channel!')
    const connection = await amqp.connect(config.rabbitMQ.url)
    const channel = await connection.createChannel()
    const exchangeName = config.rabbitMQ.exchangeName
    const trackingId = uuid()
    await channel.assertExchange(exchangeName, "direct")

    await channel.publish(
        exchangeName,
        name,
        Buffer.from(
            JSON.stringify({
                logType: name,
                data: payload,
                timeStamp: new Date().toISOString(),
                token: meta?.token,
                trackingId
            })
        )
    )

    console.info(`Publishing event with name ${name} (tracking id: ${trackingId}) to exchange ${exchangeName} with data: ${JSON.stringify(payload)}`)

    await channel.close()
}