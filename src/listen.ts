import amqp from 'amqplib'
import config from './config'
import { flow } from './types/flow';
import { JsonSchema } from './types/jsonSchema';
import { flowRunner } from './flowRunner';
import { getToken } from './flowAuth/getToken';

export async function listen<I extends Readonly<JsonSchema>>(bindingKey: string, schema: JsonSchema, body: flow<I>['body'], flowId: string, executionSource: 'request' | 'queue', stateless: boolean) {
    console.info('listen!')
    let connection
    try {
    connection = await amqp.connect(config.rabbitMQ.url)
    } catch (e) {
        console.info('retry!')
        await new Promise(resolve => setTimeout(resolve, 5000));
        connection = await amqp.connect(config.rabbitMQ.url)
    }
    console.info('channel!')
    const channel = await connection.createChannel()
    console.info('exchange!')
    await channel.assertExchange(config.rabbitMQ.exchangeName, "direct");
    console.info('queue!')
    const q = await channel.assertQueue(`${bindingKey}Queue`)
    console.info('binding!')
    await channel.bindQueue(q.queue, config.rabbitMQ.exchangeName, bindingKey)
    console.info('consume!')
    channel.consume(q.queue, async (msg) => {
        console.info(msg)
        if (msg) {
            let data : any
            if (msg?.content) {
                data = JSON.parse(msg.content.toString())
            }
            console.info(data)
            let token = data?.data?.token

            const bodyResult = await flowRunner(schema, data, body, flowId, executionSource, stateless, token)
            if (bodyResult.status === 200) {
                channel.ack(msg)
            } else if (bodyResult.status >= 400 ) {
                channel.nack(msg, undefined, false)
            }
        } else {
            console.error(`Flow Error: No Message Found`)
        }
    })
}

