import config from "../../config";
import amqp from 'amqplib';
import { v4 as uuid } from 'uuid';
import { logMessage } from "../../logging/logMessage";
import { IEmitAction } from "../../interfaces/IEmitAction";
import { IFlowInfo } from "../../interfaces/IFlowInfo";

export const emitAction = async (options: IEmitAction) => {
    const flowCheck = options.type === "flow" || options.type === undefined
    const url = flowCheck ? config.rabbitMQ.url : config.rabbitMQ.testUrl
    const connection = await amqp.connect(url)
    const channel = await connection.createChannel()
    const exchangeName = config.rabbitMQ.exchangeName
    const trackingId = uuid()
    await channel.assertExchange(exchangeName, "direct")

    const flowInfo: IFlowInfo = {
        id: options.meta?.flowId,
        executionId: options.meta?.executionId,
        tenantId: options.meta?.tenantId,
        requestId: options.meta?.requestId,
        flowMode: options.meta?.flowMode
    }

    const publishBody = {
        data: options?.payload,
        timeStamp: new Date().toISOString(),
        token: options?.meta?.token,
        requestId: options?.meta?.requestId,
        tenantId: options?.meta?.tenantId,
    }

    await channel.publish(
        exchangeName,
        options.name,
        Buffer.from(
            JSON.stringify({
                logType: options.name,
                ...publishBody,
                trackingId
            })
        )
    )

    logMessage(`Publishing event with name ${options.name} (tracking id: ${trackingId}) to exchange ${exchangeName} with data: ${JSON.stringify(publishBody.data)}`, flowInfo)

    // publish a tracked version of the emit to be potentially consumed by waitForEvent actions, if enabled
    if (options.tracked) {
        const trackingId2 = uuid()

        await channel.publish(
            exchangeName,
            `track.${options.name}`,
            Buffer.from(
                JSON.stringify({
                    logType: `track.${options.name}`,
                    ...publishBody,
                    trackingId2
                })
            )
        )
        logMessage(`Publishing tracked event with name track.${options.name} (tracking id: ${trackingId2}) to exchange ${exchangeName} with data: ${JSON.stringify(publishBody.data)}`, flowInfo)
    }


    await channel.close()
    await connection.close()


    return { status: 200, data: { trackingId } }
}