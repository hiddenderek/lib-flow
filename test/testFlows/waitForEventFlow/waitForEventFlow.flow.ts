import Flow, {emit, listenForEvent, waitForEvent} from "../../../src/index";
import { add } from "../shared/functions/add";
export default new Flow({
    id: 'waitForEventFlow',
    name: 'a new flow',
    stateless: true,
    triggers: {},
    input: {
        type: "object",
        properties: {
            helloProp: {
                type: 'string'
            },
        },
        required: ['helloProp'],
        additionalProperties: false,
    } as const,
    body: async function*([input, meta]) {
        console.log('helloProp: ' + input.helloProp)
        yield* add(20, 50)
        yield listenForEvent('emitFlowTrigger')
        yield emit('waitForEventFlowTrigger', undefined, true)
        yield* add(20, 50)
        const result = yield waitForEvent('emitFlowTrigger')
        yield* add(20, 50)
        console.log(result)
        return result.name
    }
})
