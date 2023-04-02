package policy

import input

default allow = false

publicFlows = [
  "waitForEventFlow",
  "scheduleFlow",
  "consumeFlow",
  "emitFlow",
  "askForFlow"
]

allow {
  publicFlows[_] == input.request.params.flowId
}