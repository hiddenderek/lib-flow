import Flow from "./Flow"
import { callServiceAction } from "./flowActions/callService"
import { emitManyWrapper } from "./flowActions/emitMany/emitManyWrapper"
import { emitWrapper } from "./flowActions/emit/emitWrapper"
import { flowImport } from "./flowImport"

export const emit = emitWrapper

export const emitMany = emitManyWrapper

export const callService = callServiceAction

export const importFlows = flowImport

export default Flow