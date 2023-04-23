import Flow, { FlowError } from "../../../src/index";

export default new Flow({
    id: 'urlParamFlow/:testParam',
    method: "get",
    name: 'a new flow',
    stateless: true,
    triggers: { },
    body: async function*([input, meta]) {
        console.info(meta.reqParams)
        return {...meta.reqParams, ...meta.reqQuery}
    }
})
