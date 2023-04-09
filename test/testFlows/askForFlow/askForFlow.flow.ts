import Flow, {askFor, emit, listenForEvent, waitForEvent} from "../../../src/index";

export default new Flow({
    id: 'askForFlow',
    name: 'a new flow',
    stateless: true,
    triggers: { },
    input: {
        type: "object",
        properties: {
            hi: {
                type: 'object',
                properties: {
                    bye: {
                        type: 'string'
                    }
                }
            },
            numbers: {
                type: "number"
            }
        },
        required: ['numbers'],
        additionalProperties: false,
    } as const,
    body: async function*([input]) {
        yield listenForEvent('testEvent1')
        yield listenForEvent('testEvent2')
        console.log('wait')

        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('SHOULD NOT LOG AFTER RESUME')

        const rob = yield askFor({
            type: 'object',
            properties: {
                hello: {
                    type: 'string'
                },
            },
            required: ['hello']
        })
        console.log('RESUMED ' + JSON.stringify(rob))

        yield emit('testEvent1', {numbers: "hi"}, true)
        yield waitForEvent('testEvent1')
        const rob2 = yield askFor({
            type: 'object',
            properties: {
                hello2: {
                    type: 'string'
                },
            },
            required: ['hello2']
        })

        console.log('RESUMED! ' + JSON.stringify(rob2))

        yield emit('testEvent2', {numbers: "hi"}, true)
        yield waitForEvent('testEvent2')
        return rob2
    }
})

