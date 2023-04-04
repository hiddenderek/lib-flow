import Flow, {emit} from "../../../src/index";
import { add } from "../shared/functions/add";
export default new Flow({
    id: 'consumeFlow',
    name: 'a new flow',
    stateless: true,
    triggers: { events: ['emitFlowTrigger']},
    input: {
        type: "object",
        properties: {
            data: {
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
            }
        },
        required: ['data'],
    } as const,
    body: async function*([input]) {
        console.log('consumer')
        const {numbers, hi} = input.data
        let bob = 0
        if (numbers) {
        console.log(input)
        bob = yield* add(bob, numbers)
        console.log(bob) 
        }
        yield emit('consumeFlowTrigger', undefined, true)

        return bob
    }
})

