import Flow from "../../src/Flow";
import { add } from "../shared/functions/add";
export default new Flow({
    id: 'testFlow2',
    name: 'a new flow',
    stateless: true,
    triggers: { events: ['test2RoutingKey', 'test3RoutingKey']},
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
    },
    body: async function*([input]) {
        console.log('consumer')
        const {numbers, hi} = input
        let bob = 0
        if (numbers) {
        console.log(input)
        bob = yield* add(bob, numbers)
        console.log(bob) 
        }

        return bob
    }
})

