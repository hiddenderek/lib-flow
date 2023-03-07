import Flow from "./Flow"
import { callServiceAction } from "./flowActions/callService"
import { emitAction } from "./flowActions/emit"
import { emitManyAction } from "./flowActions/emitMany"
import { flowImport } from "./flowImport"

export const emit = emitAction

export const emitMany = emitManyAction

export const callService = callServiceAction

export const importFlows = flowImport

export default Flow