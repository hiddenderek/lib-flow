import config from "../config";
import amqp from 'amqplib';
import { v4 as uuid } from 'uuid';
import { JsonSchema } from "src/types/jsonSchema";

export const emitAction = async (name: string, payload: Record<string, any>, token?: string) => {
    if (!token) {
        const [input, meta] : [input: JsonSchema, meta: {token?: string}]= emitAction.caller.arguments[0]
        token = meta?.token
    }
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
                token,
                trackingId
            })
        )
    )

    console.info(`Publishing event with name ${name} (tracking id: ${trackingId}) to exchange ${exchangeName} with data: ${JSON.stringify(payload)}`)

    await channel.close()
}