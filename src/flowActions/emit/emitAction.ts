import config from "../../config";
import amqp from 'amqplib';
import { v4 as uuid } from 'uuid';
import { logMessage } from "../../logging/logMessage";
import { IEmitAction } from "../../interfaces/IEmitAction";
import { IFlowLog } from "../../interfaces/IFlowLog";

export const emitAction = async (options: IEmitAction) => {
    console.log(options.type)
    const flowCheck = options.type === "flow" || options.type === undefined
    console.log(flowCheck)
    console.log( config.rabbitMQ.url) 
    const url = flowCheck ? config.rabbitMQ.url : config.rabbitMQ.testUrl
    console.log(url)
    const connection = await amqp.connect(url)
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
                data: options?.payload,
                timeStamp: new Date().toISOString(),
                token: options?.meta?.token,
                requestId: options?.meta?.requestId,
                tenantId: options?.meta?.tenantId,
                trackingId
            })
        )
    )
    const flowLog : IFlowLog = {
        id: options.meta?.flowId,
        executionId: options.meta?.executionId, 
        tenantId: options.meta?.tenantId,
        requestId:  options.meta?.requestId,
    }

    logMessage(`Publishing event with name ${options.name} (tracking id: ${trackingId}) to exchange ${exchangeName} with data: ${JSON.stringify(options.payload)}`, flowLog)
    if (!flowCheck) {
        await channel.deleteQueue(options.name)
    }
    await channel.close()
    if (!flowCheck) {
        await connection.close()
    }

    return {status: 200, data: {}}
}