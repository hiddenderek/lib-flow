package policy

import input

default allow = false

publicFlows = [
  "waitForEventFlow",
  "scheduleFlow",
  "consumeFlow",
  "emitFlow",
  "askForFlow",
  "errorFlow",
  "urlParamFlow/:testParam"
]

allow {
    regex.match(concat("", ["^", regex.replace( publicFlows[_], "/:[^/]+", "/[^/]+"), "$"]), input.request.params.flowId)
}