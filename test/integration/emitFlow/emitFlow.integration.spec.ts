import {FlowTestSuite, EventTestSuite} from '../../../src/index'
import { CLIENT_DETAILS } from '../../utils/auth'

describe('emitFlow', () => {
    let flowTestSuite: FlowTestSuite
    let eventTestSuite: EventTestSuite
    beforeAll(async() => {
        flowTestSuite = await FlowTestSuite.init(CLIENT_DETAILS['test-runner'], 'emitFlow')
        eventTestSuite = await EventTestSuite.init(CLIENT_DETAILS['test-runner'])
    })

    it('should emit an event', async () => {
        await flowTestSuite.start({hi: 'hello'})
        const event = await eventTestSuite.waitForEvent('emitFlowTrigger')
        expect(event.name).toEqual('emitFlowTrigger')
        expect(event.payload).toEqual({numbers: 502})
        expect(flowTestSuite.responsePayload).toEqual('hello')
    })
})