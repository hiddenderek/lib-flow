import Flow from "./Flow"
import { callServiceAction } from "./flowActions/callService"
import { emitAction } from "./flowActions/emitAction"
import { emitManyAction } from "./flowActions/emitManyAction"
import { flowImport } from "./flowImport"

export const emit = emitAction

export const emitMany = emitManyAction

export const callService = callServiceAction

export const importFlows = flowImport

export default Flow