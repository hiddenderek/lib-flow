# microservice-lib-flow

This flow library provides a back end suite of tools compiled together into one easy-to-use light weight package for your convenience. This includes (but is not limited to) full functionality REST API endpoints, built in AMQP producers/consumers (and ways to track messages), scheduled CRON jobs, rego policy validation, in depth logging, and a test suite.

## How do flows work?

As mentioned before, flows are a suite of tools for backend operations. 

You can create a flow like so:

```typescript
import Flow from "@hiddenderek/microservice-lib-flow-dc"; 

export default new Flow({
    id: 'exampleFlow',
    name: 'a new flow',
    stateless: true,
    triggers: { events: ['emitFlowTrigger']},
    input: {
        type: "object",
        properties: {
            data: {
                type: "object",
                properties: {
                },
            }
        },
        required: ['data'],
    } as const,
    body: async function*([input]) {
        const {numbers, hi} = input.data

        
        await new Promise(resolve => setTimeout(resolve, 2000));

        yield askFor({
            type: 'object',
            properties: {
                hello: {
                    type: 'string'
                },
            },
            required: ['hello']
        })

        yield* add(452323, numbers)

        return numbers
    }
})
```

Note how flows now contain async generator functions which allow for both yield and await functionality. 

As a result, all of the tools described in this documentation are optional and you are free to use /create whatever functionality you like!

You will notice that flows are a class that is instantiated with multiple different properties. These are all the possiple properties and their types:

```typescript
    export interface IFlow<I> {
        id: string,
        method?: AllowedRequests,
        name: string,
        stateless: boolean,
        triggers?: {events?: string[], schedules?: string[]},
        input?: I,
        body: ([input, meta]) => AsyncGenerator<any, any, any>
    }
```

Lets get into explaining each one!

### `id`

This is the id of the flow. What does that mean? Essentially, it is the endpoint of your REST API.

Flows use express internally, so any express syntax will work. Here is an example of making the ID use a parameter.

```typescript
export default new Flow({
    id: 'urlParamFlow/:testParam',
    method: "get",
    name: 'a new flow',
    stateless: true,
    triggers: { },
    body: async function*([input, meta]) {
        console.info(meta.reqParams)
        console.info(meta.reqQuery)
        // will show {testParam: string}
        // will show {testQuery: string} if query param values are provided when hitting flow endpoint
    }
})
```

This flows id creates the following express route:

{baseUrl}/v0/flow/start/nelnet/urlParamFlow/:testParam

Endpoints will be dynamically structured like so:

{baseUrl}/version/flow/mode/tenantId/flowId

The tenantId will be specified in the 'CLIENT_TENANT' environment variable, and will default to 'nelnet' if not specified.

If you're restricting flow execution from a rego policy, you will need to use regular expressions to validate a flow id containing a dynamic parameter.

This requres regex.match, which is only available in OPA 0.45.0 and later.

Here is an example of matching a dynamic parameter with regex.match in a rego policy file:

```typescript
package policy

import input

default allow = false

publicFlows = [
  "urlParamFlow/:testParam"
]

allow {
    regex.match(concat("", ["^", regex.replace( publicFlows[_], "/:[^/]+", "/[^/]+"), "$"]), input.request.params.flowId)
}
```

This regex is essentially ignoring anything in the parameter as it has an unknown value.

### `method`

The type of method you will be using for your endpoint. Currently supports GET, POST, PUT, PATCH, and DELETE.

### `name`

A short description of the flow and how it works. Does nothing yet.

### `stateless`

Determines if your flow will record its state in the database. Does nothing yet.

### `triggers`

Triggers determine if your code can be triggered by other methods than just a REST api endpoint. 

Currently supports:

- cron jobs (using cron syntax, see https://www.npmjs.com/package/cron for more details)

- AMQP messages / events

Here is an example of a flow triggered by a cron job every minute:

```typescript
export default new Flow({
    id: 'scheduleFlow',
    name: 'a new floww',
    stateless: true,
    triggers: {
        schedules: ['0-59 * * * *'],
    },
    body: async function*([input, meta]) {
        console.log('scheduled operation!')

        return `Schedule completed at ${meta.startTime}`
    }
})
```

As you can see, the cron job will be passed in under the 'schedules' property of the triggers. It is an array of strings, so you can pass in multiple cron job schedules at once for one flow if desired.

Here is an example of a flow triggered by an AMQP message / event

```typescript
export default new Flow({
    id: 'consumeFlow',
    name: 'a new flow',
    stateless: true,
    triggers: { events: ['emitFlowTrigger']},
    input: {
        type: "object",
        properties: {
            data: {
                type: "object",
                properties: {
                    numbers: {
                        type: "number"
                    }
                },
                required: ['numbers'],
            }
        },
        required: ['data'],
    } as const,
    body: async function*([input, meta]) {
        console.log('consumer')
        const {numbers} = input.data
        return numbers
    }
})
```
When you create a new flow, a direct exchange will be automatically set up. All flows for this tenant will share this exchange. The values specified in the events array property are binding keys. For each binding key specified, a message queue will be automatically created. The exchange will send a message with a matching binding key to the relevant queue. 

This effectively creates the ability for event driven architecture managed by queues.

### `input`

A json schema for your flow. If triggered from an event or an endpoint, the request body data / event payload must match the schema provided or the response will be a 422 error.

### `body`

This is where your code lives. Bodys are async generator functions. This allows for both async/await based syntax and yield based syntax. 

You will notice that bodys have both an input and a meta object that are accessible. The input object is the input data received if the schema is validated successfully. 

The meta object provides useful information about the context of your code excution:

```typescript
export interface IMeta {
    flowId: string,
    executionId: string,
    requestId?: string,
    tenantId?: string,
    startTime: string,
    token?: string,
    flowMode?: 'start' | 'resume',
    reqParams?: Record<string, any>
    reqQuery?: Record<string, any>
}
```

#### `meta.flowId`

This the id of your flow. Pretty simple.

#### `meta.executionId`

This the randomly generated execution id of your flow. It is in UUID format. Each time a body is ran you will get a new one.

#### `meta.requestId`

This the id of your request. If your body triggers multiple other flows through events, this request id will stay the same throughout the entire event chain.

#### `meta.tenantId`

The current tenant id. Will stay the same throughout the entire event chain.

#### `meta.startTime`

The time your flow was triggered. Stored in ISO string format.

#### `meta.token`

The authentication token that was succesfully used to trigger the flow. This will stay the same throughout the entire event chain.

#### `meta.flowMode`

Tells you if the flow was triggered by v0/flow/start or v0/flow/resume

#### `meta.reqParams`

An object of all the request parameters speciifed in your flowId endpoint. Currently only accessible on the flow that the the request was triggered on.

#### `meta.reqQuery`

An object of all the request query parameters speciifed in your flowId endpoint. Currently only accessible on the flow that the the request was triggered on.

Here is an example of accessing meta data (in this case, reqParams and reqQuery) directly through the meta object.

```typescript
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
```
### Flow return value

The return value of the body, if successful, contains the following:

```typescript
export interface IFlowSuccess {
    id: string, // executionId
    flowId: string, 
    flowVersion: number, 
    tenantId: string, 
    requestId: string,
    continuation: { 
        command?: Record<string, any>, // the current command, if any
        status: 'completed' | 'pending' | 'failed', // the current flow execution status
        result?: Record<string, any> // any returned data in the flow
    }
}
```

When you return a value, if it contains 'resStatus' as a property, the response status will automatically be set to that number.

Example:

```typescript
export default new Flow({
    id: 'scheduleFlow',
    name: 'a new flow',
    stateless: true,
    triggers: {
        schedules: ['0-59 * * * *'],
    },
    body: async function*([input, meta]) {
        return {resStatus: 204}
    }
})
```

## Actions

There are many actions you can utilize with flows. Actions are functionality that streamline functionality such as emitting events, making api calls, and pausing the body and asking for additional data.

You can call an action by using "yield" inside the flow body.

### `emit`

Emits a AMQP message / event to a queue with a matching binding key. 

Can be used to trigger flows with matching event names in their 'triggers' property.

Emit has 3 parameters: 
    - the corresponding binding key for the message to be routed to. 
    - any payload data to be sent along with the event
    - a boolean value to turn on tracking data. 

Here is an example of using emit:

```typescript
    yield emit('emitFlowTrigger', {numbers: bob}, true)
```

When tracking data is turned on, a second event is emitted, but with "track." appended to the beginning.

This second event can be consumed by a waitForEvent action to confirm that an event chain has completed succesfully.

See below for more details. 

### `emitMany`

Emits multiple events at once. 

```typescript
    yield emitMany([
        {
            name: 'testEvent1',
            payload: {hi: "hello"},
            tracked: false
        },
        {
            name: 'testEvent2',
            payload: {hi: "hello"},
            tracked: false
        }
    ])
```

### `callService`

Calls a velocity service. 

Automatically has the velocity base url at the beginning, and handles token authentication for you.

```typescript
    yield callService('v4.task.retore', 
        {
            testData1: "testValue1",
            testData2: "testValue2"
        }
    )
```

### `askFor`

Pauses flow execution and sends a response containing the required data to resume.

Parameter is a json schema value. 

```typescript
    const rob = yield askFor({
        type: 'object',
        properties: {
            hello: {
                type: 'string'
            },
        },
        required: ['hello']
    })
```

In order to resume, you must call the same flow but with 

'/v0/flow/resume/tenantId/flowId'

instead of the usual 

'/v0/flow/start/tenantId/flowId'

Resuming the flow requires two parameters in the request body:

    - executionId: the execution id returned in the askFor response.

    - resumeWith: the resume with data matching the json schema contained in the askFor response.


### `listenForEvent`

Creates a queue to consume a tracked event. 
This must be done before the event is emitted, or it will not be consumed properly. 

```typescript
        yield listenForEvent('emitFlowTrigger')
        yield emit('waitForEventFlowTrigger', undefined, true)
        const result = yield waitForEvent('emitFlowTrigger'
```

### `waitForEvent`

Waits for a tracked event before continuing flow execution.
This can be helpful for confirming that an event chain has completed before returning a value.
Tracked events are only consumed if they contain the same requestId meta information. 
This is to avoid contamination with other flow executions.
See the emit action above for more details on tracked events.

Returns the event name and payload

```typescript
        yield listenForEvent('emitFlowTrigger')
        yield emit('waitForEventFlowTrigger', undefined, true)
        const result = yield waitForEvent('emitFlowTrigger')
        console.log(result.name, result.payload)
```

## Setting up flows

Flows require a few steps to set up, so lets get started!

### Installing packages

Make sure to add the following libraries in your package.json:

```json
  "devDependencies": {
    "@types/amqplib": "^0.10.1",
    "@types/express": "^4.17.17",
    "@types/cookie-parser": "^1.4.2",
    "typescript": "^4.8.4"
  },
  "dependencies": {
    "@hiddenderek/microservice-lib-flow-dc": "1.1.0",
    "amqplib": "^0.10.3",
    "express": "^4.18.2",
    "ts-node": "^10.9.1",
  }
```

### Configuring docker

You will need a rabbitmq and opa container in your docker compose file, along with a new 'app' container that will house all the flows

```yaml
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - 5672:5672
      - 15672:15672
  opa:
    image: openpolicyagent/opa:0.29.4
    restart: on-failure
    volumes:
      - ./src/flows/policies/:/data
    command: run --server --log-level=debug --log-format=json-pretty --watch /data/policy.rego
    ports:
      - 8181:8181
  app:
    build:
      context: .
      dockerfile: Dockerfile_app
      args:
        NODE_ENV: development
    ports:
      - "8111:8111"
    env_file:
    - .env
    restart: always
    depends_on:
      - postgres
      - rabbitmq
    volumes:
      - ./src:/app/src
      - ./tsconfig.json:/app/tsconfig.json
      - ./webpack.config.js:/app/webpack.config.js
    environment:
      - NODE_ENV=development
    command: npm run dev
```

You will need a docker file for your app container that sets up your flow environment properly.

```dockerfile
FROM node:16
WORKDIR /app
COPY package.json .
COPY .npmrc .
ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
        then npm install && npm install ts-node -g; \
        else npm install --only=production; \
        fi

COPY . ./
EXPOSE 8111
CMD ["ts-node", "src/flows/flowServer.ts"]
```

### Setting up the flow server

You'll see in the docker file that we need a flowServer.ts file. Lets create one under src/flows/flowServer.ts

example flow server:

```typescript
import express from 'express'
import processEnv from 'dotenv'
import { importFlows } from "@hiddenderek/microservice-lib-flow-dc"

processEnv.config()
const app = express()
app.use(express.json({ limit: "2mb" }));


async function startServer(app: any) {
     await importFlows(app, __dirname, './')
    
     app.listen(8111, function listenHandler() {
          console.info(`Running on 8111`)
     })
}

startServer(app)
```

You'll see that we are doing the usual express server syntax here. That is all well documented elsewhere. 
The difference is that we are also importing an 'importFlows' function from the flow library.

This function will automatically add all our flows to our express routes! 

It has 3 parameters: The current express application, the current directory path, and the relative path we want to look for flows in.

Lets take an overview of how our current folder structure looks:

```
src/
    flows/
        flowServer.ts
.env
package-lock.json
package.json
docker-compose.yaml
Dockerfile_app
```

So, with our current location, importFlows will look for any flows in the 'flows' folder.

Lets add some flows! Make sure to always end them with .flow.ts, or importFlows will ignore them. Like so:

```
src/
    flows/
        testFlow.flow.ts
        testFlow2.flow.ts
        flowServer.ts
.env
package-lock.json
package.json
docker-compose.yaml
Dockerfile_app
```

After you added your flows, you can set up your rego policy files and then you should just have to run your docker compose file and be good to go!

## Flow Test Suite

The flow library comes with a built in flow test suite.

Here is an example of using one:

```typescript
import {FlowTestSuite, EventTestSuite} from  "@hiddenderek/microservice-lib-flow-dc"
import { CLIENT_DETAILS } from '../../utils/auth'

describe('emitFlow', () => {
    let flowTestSuite: FlowTestSuite
    let eventTestSuite: EventTestSuite
    beforeAll(async() => {
        flowTestSuite = await FlowTestSuite.init(CLIENT_DETAILS['test-runner'], 'emitFlow')
        eventTestSuite = await EventTestSuite.init(CLIENT_DETAILS['test-runner'])
    })

    it('should emit an event', async () => {
        await eventTestSuite.listenForEvent('emitFlowTrigger')
        await flowTestSuite.start({hi: 'hello'})
        const event = await eventTestSuite.waitForEvent('emitFlowTrigger', undefined, flowTestSuite.requestId)
        expect(event.name).toEqual('track.emitFlowTrigger')
        expect(event.payload).toEqual({numbers: 42})
        expect(flowTestSuite.responsePayload).toEqual('hello')
    })
})
```

Lets break it down!

You can import the FlowTestSuite and EventTestSuite directly from the flow library.

Set up includes the init function, which requires special values for token authentication for the first parameter.

For FlowTestSuite, you will need to specify the flowId in the second parameter.

FlowTestSuite has multiple actions:

### `start`

Starts a flow with a specified input in the first parameter.
Second parameter specifies the request method. Defaults to post if not provided.

Example: 

```typescript
        await flowTestSuite.start({testValue: "testValue"}, "get")
```


### `resume`

Resumes a flow after an askFor action sends it into pending. 

Must provide the executionId as the first parameter, and the correct resumeWith value as the second parameter.

Example:

```typescript
    await flowTestSuite.start({numbers: 234})
    expect(flowTestSuite.status).toEqual("pending")
    await eventTestSuite.listenForEvent('testEvent1')
    await flowTestSuite.resume(flowTestSuite.executionId as string, {hello: "hi!"})
```

EventTestSuite has multiple actions:

### `emit`

Emits an event, first parameter is the event name, second is the event payload.

Example: 

```typescript
    await eventTestSuite.emit('emitFlowTrigger', {numbers: 502})
```


### `listenForEvent`

Creates a queue to consume a tracked event. 
This must be done before the event is emitted, or it will not be consumed properly. 

```typescript
    await eventTestSuite.listenForEvent('emitFlowTrigger')
    await flowTestSuite.start({hi: 'hello'})
    const event = await eventTestSuite.waitForEvent('emitFlowTrigger', undefined, flowTestSuite.requestId)
```

### `waitForEvent`

Pauses test execution until the specified event is consumed

Has 3 parameters: 

    - event name
    - timeout (milliseconds)
    - requestId

Returns the event name and payload.

```typescript
    await eventTestSuite.listenForEvent('consumeFlowTrigger')
    await eventTestSuite.emit('emitFlowTrigger', {numbers: 502})
    const event = await eventTestSuite.waitForEvent('consumeFlowTrigger')
    expect(event.name).toEqual('track.emitFlowTrigger')
    expect(event.payload).toEqual({numbers: 42})
```

If you are waiting for an event after starting an event manually, 
you will need to pass in the request id in the third parameter or it will not work.


```typescript
    await eventTestSuite.listenForEvent('emitFlowTrigger')
    await flowTestSuite.start({hi: 'hello'})
    const event = await eventTestSuite.waitForEvent('emitFlowTrigger', 5000, flowTestSuite.requestId)
```

