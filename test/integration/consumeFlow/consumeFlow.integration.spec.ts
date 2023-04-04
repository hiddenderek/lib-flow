import {FlowTestSuite, EventTestSuite} from '../../../src/index'
import { CLIENT_DETAILS } from '../../utils/auth'

describe('emitFlow', () => {
    let eventTestSuite: EventTestSuite
    beforeAll(async() => {
        eventTestSuite = await EventTestSuite.init(CLIENT_DETAILS['test-runner'])
    })

    it('should emit an event', async () => {
        await eventTestSuite.listenForEvent('consumeFlowTrigger')
        await eventTestSuite.emit('emitFlowTrigger', {numbers: 502})
        const event = await eventTestSuite.waitForEvent('consumeFlowTrigger')
        expect(event.name).toEqual('track.consumeFlowTrigger')
        expect(event.payload).toEqual(undefined)
    })
})