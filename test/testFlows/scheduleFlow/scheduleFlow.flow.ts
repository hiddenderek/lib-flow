import Flow, {emit} from "../../../src/index";

export default new Flow({
    id: 'scheduleFlow',
    name: 'a new flowww',
    stateless: true,
    triggers: {
        schedules: ['0-59 * * * *'],
    },
    input: {
        type: "object",
        properties: {
        },
        additionalProperties: false,
    } as const,
    body: async function*([input, meta]) {
        console.log('scheduled operation!')

        return `Schedule completed at ${meta.startTime}`
    }
})
