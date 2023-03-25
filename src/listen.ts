import amqp from 'amqplib'
import config from './config'
import { IFlow } from './interfaces/IFlow';
import { JsonSchema } from './types/jsonSchema';
import { flowRunner } from './flowRunner';
import { logMessage } from './logging/logMessage';
import { logError } from './errors/logError';

export async function listen<I extends Readonly<JsonSchema>>(bindingKey: string, schema: JsonSchema, body: IFlow<I>['body'], flowId: string, executionSource: 'request' | 'queue', stateless: boolean) {
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
            try {
                let content : any
                if (msg?.content) {
                    content = JSON.parse(msg.content.toString())
                }
                console.info(content)
                let token = content?.token
                let requestId = content?.requestId
                const {logType, data, timeStamp} = content
                const input = {id: logType, data, timeStamp} as any
    
                logMessage(`Consuming event with name ${logType} (tracking id: ${content?.trackingId}) with data: ${JSON.stringify(content)}`)
                const bodyResult = await flowRunner(schema, input, body, flowId, executionSource, stateless, token, requestId)
                if (bodyResult.status === 200) {
                    channel.ack(msg)
                } else if (bodyResult.status >= 400 ) {
                    channel.nack(msg, undefined, false)
                }
            } catch (e) {
                logError('Error consuming message', flowId, stateless, undefined, undefined, JSON.stringify(e))
                channel.nack(msg, undefined, false)
            }
        } else {
            console.error(`Flow Error: No Message Found`)
        }
    })
}

