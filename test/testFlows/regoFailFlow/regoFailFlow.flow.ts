import Flow, {emit} from "../../../src/index";

export default new Flow({
    id: 'regoFailFlow',
    name: 'a new flowww',
    stateless: true,
    triggers: {
    },
    input: {
        type: "object",
        properties: {
        },
        additionalProperties: false,
    } as const,
    body: async function*([input, meta]) {
        console.log('this should not run')
        return 1
    }
})

