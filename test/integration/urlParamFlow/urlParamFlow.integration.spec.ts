import {FlowTestSuite} from '../../../src/index'
import { CLIENT_DETAILS } from '../../utils/auth'

describe('urlParamFlow', () => {
    let flowTestSuite: FlowTestSuite
    beforeAll(async() => {
        flowTestSuite = await FlowTestSuite.init(CLIENT_DETAILS['test-runner'], 'urlParamFlow/testValue')
    })

    it('should return url parameter', async () => {
        await flowTestSuite.start(undefined, "get")
        expect(flowTestSuite.responsePayload).toEqual({testParam: "testValue"})
    })
})

describe('urlQueryFlow', () => {
    let flowTestSuite: FlowTestSuite
    beforeAll(async() => {
        flowTestSuite = await FlowTestSuite.init(CLIENT_DETAILS['test-runner'], 'urlParamFlow/testValue?testQuery=testQueryValue')
    })

    it('should return url parameter', async () => {
        await flowTestSuite.start(undefined, "get")
        expect(flowTestSuite.responsePayload).toEqual({testParam: "testValue", testQuery: "testQueryValue"})
    })
})