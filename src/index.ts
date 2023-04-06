import Flow from "./Flow"
import { emitManyWrapper } from "./flowActions/emitMany/emitManyWrapper"
import { emitWrapper } from "./flowActions/emit/emitWrapper"
import { flowImport } from "./flowImport"
import { askForWrapper } from "./flowActions/askFor/askForWrapper"
import { callServiceWrapper } from "./flowActions/callService/callServiceWrapper"
import { FlowErrorWrapper } from "./errors/FlowErrorWrapper"
import { FlowTestSuiteBuilder } from "./testSuites/flowTestSuiteBuilder"
import { EventTestSuiteBuilder } from "./testSuites/eventTestSuiteBuilder"
import { waitForEventWrapper } from "./flowActions/waitForEvent/waitForEventWrapper"
import { listenForEventWrapper } from "./flowActions/listenForEvent/listenForEventWrapper"

export const emit = emitWrapper

export const emitMany = emitManyWrapper

export const askFor = askForWrapper

export const callService = callServiceWrapper

export const waitForEvent = waitForEventWrapper

export const listenForEvent = listenForEventWrapper

export const importFlows = flowImport

export const FlowError = FlowErrorWrapper

export const FlowTestSuite = new FlowTestSuiteBuilder()

export type FlowTestSuite = typeof FlowTestSuite

export const EventTestSuite = new EventTestSuiteBuilder()

export type EventTestSuite = typeof EventTestSuite

export default Flow