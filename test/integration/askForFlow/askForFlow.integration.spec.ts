import {FlowTestSuite, EventTestSuite} from '../../../src/index'
import { CLIENT_DETAILS } from '../../utils/auth'

describe('askForFlow', () => {
    let flowTestSuite: FlowTestSuite
    let eventTestSuite: EventTestSuite
    beforeAll(async() => {
        flowTestSuite = await FlowTestSuite.init(CLIENT_DETAILS['test-runner'], 'askForFlow')
        eventTestSuite = await EventTestSuite.init(CLIENT_DETAILS['test-runner'])
    })

    it('should emit an event', async () => {
        await flowTestSuite.start({numbers: 234})
        console.log(flowTestSuite.responsePayload)
        console.log(flowTestSuite.executionId)
        expect(flowTestSuite.status).toEqual("pending")
        await eventTestSuite.listenForEvent('testEvent1')
        await flowTestSuite.resume(flowTestSuite.executionId as string, {hello: "hi!"})
        console.log('REQUEST ID RESUME: ' + flowTestSuite.requestId)
        console.log('REQUEST ID RESUME 1: ' + flowTestSuite.requestId)
        await eventTestSuite.waitForEvent('testEvent1', undefined, flowTestSuite.requestId)
        console.log(flowTestSuite.responsePayload)
        console.log(flowTestSuite.executionId)
        expect(flowTestSuite.status).toEqual("pending")
        await eventTestSuite.listenForEvent('testEvent2')
        await flowTestSuite.resume(flowTestSuite.executionId as string, {hello2: "hi!"})
        console.log('REQUEST ID RESUME 2: ' + flowTestSuite.requestId)
        await eventTestSuite.waitForEvent('testEvent2', undefined, flowTestSuite.requestId)
        console.log(flowTestSuite.responsePayload)
        console.log(flowTestSuite.executionId)
        expect(flowTestSuite.status).toEqual("completed")
    })
})