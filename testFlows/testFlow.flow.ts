import Flow, {emit} from "../src/index";
export default new Flow({
    id: 'testFlow',
    name: 'a new flow',
    stateless: true,
    triggers: {events: ['testBindingKey']},
    input: {
        type: "object",
        properties: {
            hi: {
                type: 'string'
            },
            numbers: {
                type: "object",
                properties: {
                    hi: {
                        type: "object",
                        properties: {
                            hi: {
                                type: 'string'
                            },
                            numbers: {
                                type: "number"
                            }
                        },
                        required: ["hi"],
                        additionalProperties: false,
                    },
                    numbers: {
                        type: "number"
                    }
                },
                required: ["hi"],
                additionalProperties: false,
            }
        },
        required: ['hi'],
        additionalProperties: true,
    } as const,
    body: async function*([input, meta]) {
        console.log('producer!')
        console.log(input)
        const bob = input.hi + 2
        console.log(bob) 
        emit('test3RoutingKey', {number: bob})
        return bob
    }
})
