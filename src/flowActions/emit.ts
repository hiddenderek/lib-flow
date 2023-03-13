import { JsonSchema, JsonSchemaToType } from "../types/jsonSchemaToType"
import amqp from 'amqplib'
import config from '../config';


export const emitAction = async (name: string, payload: Record<string, any>) => {
    console.log('creating channel!')
    const connection = await amqp.connect(config.rabbitMQ.url)
    const channel = await connection.createChannel()


    const exchangeName = config.rabbitMQ.exchangeName
    await channel.assertExchange(exchangeName, "direct")

    await channel.publish(
        exchangeName,
        name,
        Buffer.from(
            JSON.stringify({
                logType: name,
                data: payload,
                dateTime: new Date()
            })
        )
    )

    console.info(`Publishing event with name ${name} to exchange ${exchangeName} with data: ${JSON.stringify(payload)}`)

    await channel.close()
}