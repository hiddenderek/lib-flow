import {FlowTestSuite} from '../../../src/index'
import { CLIENT_DETAILS } from '../../utils/auth'

describe('emitFlow', () => {
    let flowTestSuite: FlowTestSuite
    beforeAll(async() => {
        flowTestSuite = await FlowTestSuite.init(CLIENT_DETAILS['test-runner'], 'errorFlow')
    })

    it('should fail at schema', async () => {
        try {
        await flowTestSuite.start({hi: 'hello'})
        } catch (e: any) {
            expect(e.response.data).toEqual(
                {
                    name: 'BadRequestError',
                    code: 422,
                    requestID: expect.any(String),
                    data: [
                      {
                        instancePath: '',
                        schemaPath: '#/required',
                        keyword: 'required',
                        params: {
                            missingProperty: "schemaToFail"
                        },
                        message: "must have required property 'schemaToFail'"
                      }
                    ]
                }
            )
        }
    })

    it('should fail at flow error', async () => {
        try {
        await flowTestSuite.start({schemaToFail: ['hello']})
        } catch (e: any) {
            expect(e.response.data).toEqual(
                {
                    name: "BadRequestError",
                    code: 500,
                    requestID: expect.any(String),
                    data: {
                        code: 500,
                        message: "Something happened! Oh no!",
                        name: 'FlowError'
                    },
                   
                }
            )
        }
    })
})