import Flow, { FlowError } from "../../../src/index";

export default new Flow({
    id: 'errorFlow',
    name: 'a new flow',
    stateless: true,
    triggers: { },
    input: {
        type: "object",
        properties: {
            schemaToFail: {
                type: 'array',
                items: {
                    type: 'string'
                }
            },
        },
        required: ['schemaToFail'],
        additionalProperties: false,
    } as const,
    body: async function*([input]) {
        throw new FlowError('Something happened! Oh no!')
    }
})
