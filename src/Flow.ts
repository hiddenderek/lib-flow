import { IFlow } from "./interfaces/IFlow";
import express from 'express'
import cron from 'node-cron'
import {listen} from './listen'
import { flowRunner } from "./flowRunner";
import { JsonSchema } from "./types/jsonSchema";
import { parseToken } from "./utils/parseToken";
import config from "./config";
import { getToken } from "./flowAuth/getToken";
import { v4 as uuidv4 } from 'uuid';
import { logMessage } from "./logging/logMessage";
import LRUCache from "lru-cache";
import { envVarToNumber } from "./utils/envVarToNumber";
import { IFlowFailure } from "./interfaces/IFlowFailure";
import { logError } from "./logging/logError";
import { IFlowLog } from "./interfaces/IFlowLog";
interface Flow<I> extends IFlow<I> {}

class Flow<I extends Readonly<JsonSchema>> {
    public constructor(content: IFlow<I>) {
        this.id = content.id;
        this.name = content.name;
        this.stateless = content.stateless;
        this.input = content.input;
        this.body = content.body;
        this.triggers = content.triggers
        this.method = content?.method
        if (content?.triggers?.events) {
            content.triggers.events.forEach((event) => {
                listen<typeof content.input>(event, this.input, this.body, this.id, 'queue', this.stateless, this.cache )
            })
        }
        if (content?.triggers?.schedules) {
            content.triggers.schedules.forEach((schedule) => {
                const tenantId = process?.env?.CLIENT_TENANT || 'nelnet'
                const flowLog : IFlowLog = {
                    id:  this.id, 
                    stateless: this.stateless, 
                    executionSource: 'cron', 
                    tenantId
                }
                const isValid = cron.validate(schedule)
                if (isValid) {
                    cron.schedule(schedule, async () => {
                        const {access_token}  = await getToken('exchange')
                        const requestId = uuidv4() 
                        logMessage(`Running scheduled job for flow '${this.id}'`, flowLog)
                        await flowRunner(this.input, {} as any, this.body, this.id, 'cron', this.stateless, access_token, requestId, tenantId, this.cache)
                    })
                } else {
                    logError(`Invalid Cron Schedule '${schedule}'. Skipping.`, flowLog)
                }
            })
        }
    }

    private router = express.Router()

    private cache = new LRUCache({
        max: envVarToNumber(process?.env?.FLOW_RUNTIME_CACHE_SIZE, 20),
        ttl: envVarToNumber(process?.env?.FLOW_RUNTIME_CACHE_TTL, 86_400_000), // 1 day
    })

    public makeRoute = () => {
        // @ts-ignore
        this.router.use(function timeLog(req , res, next) {
            next();
        });

        this.router[this.method ? this.method : 'post'](`/v${config.flow.version}/flow/start/${this.id}`, async(req: any, res: any) => {
            const authenticateToken = req.headers['authorization'] || ''
            const token = parseToken(authenticateToken) || ''
            const requestId = uuidv4()
            const tenantId = process?.env?.CLIENT_TENANT || 'nelnet'
            const result = await flowRunner(
                this.input, 
                req.body, 
                this.body, 
                this.id, 
                'request', 
                this.stateless, 
                token, 
                requestId, 
                tenantId, 
                this.cache, 
                "start")
            res.status(result.status)
            res.json(result.flowResult)
        }) 

        this.router[this.method ? this.method : 'post'](`/v${config.flow.version}/flow/resume/${this.id}`, async(req: any, res: any) => {
            const authenticateToken = req.headers['authorization'] || ''
            const token = parseToken(authenticateToken) || ''
            const requestId = uuidv4()
            const tenantId = process?.env?.CLIENT_TENANT || 'nelnet'
            const executionId = req?.body?.executionId
            const resumeWith = req?.body?.resumeWith
            if (executionId) {
                const result = await flowRunner(
                    this.input, 
                    req.body, 
                    this.body, 
                    this.id, 
                    'request', 
                    this.stateless, 
                    token, 
                    requestId, 
                    tenantId, 
                    this.cache, 
                    "resume", 
                    {executionId, resumeWith}
                )
                res.status(result.status)
                res.json(result.flowResult)
            } else {
                const flowFailure : IFlowFailure = {
                    requestID : requestId,
                    message: 'execution id not provided',
                    data: {},
                    name: "BadRequestError",
                    code: 404
                }
                res.status(404)
                res.json(flowFailure)
            }
        })  
    }
}

export default Flow