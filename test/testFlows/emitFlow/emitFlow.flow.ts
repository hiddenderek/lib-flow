import Flow, {emit} from "../../../src/index";
import { add } from "../shared/functions/add";
export default new Flow({
    id: 'emitFlow',
    name: 'a new flow',
    stateless: true,
    triggers: { events: ['waitForEventFlowTrigger']},
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
        additionalProperties: true,
    } as const,
    body: async function*([input, meta]) {
        const bob = input?.hi ?? 22
        yield 1 + 1
        yield* add(452323, 40232323)
        yield* add(4523323, 40232323)
        yield* add(452323, 40232323)
        yield* add(4523323, 40232323)
        yield emit('emitFlowTrigger', {numbers: bob})
        return bob
    }
})
