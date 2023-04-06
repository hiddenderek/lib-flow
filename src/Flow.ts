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
import { logError } from "./logging/logError";
import { IFlowInfo } from "./interfaces/IFlowInfo";
import { BadRequestError } from "./errors/BadRequestError";
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
                try {
                    listen<typeof content.input>(event, this.input, this.body, this.id, 'queue', this.stateless, this.cache )
                } catch (e) {
                    const flowInfo : IFlowInfo = {
                        id:  this.id, 
                        stateless: this.stateless, 
                        executionSource: 'queue', 
                    }
                    logError(`Uncaught error consuming event '${this.id}'`, flowInfo, JSON.stringify(e))
                }
            })
        }
        if (content?.triggers?.schedules) {
            content.triggers.schedules.forEach((schedule) => {
                const tenantId = process?.env?.CLIENT_TENANT || 'nelnet'
                const flowInfo : IFlowInfo = {
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
                        logMessage(`Running scheduled job for flow '${this.id}'`, flowInfo)
                        await flowRunner(this.input, {} as any, this.body, this.id, 'cron', this.stateless, access_token, requestId, tenantId, this.cache)
                    })
                } else {
                    logError(`Invalid Cron Schedule '${schedule}'. Skipping.`, flowInfo)
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
                const message = "Execution id not provided"
                const status = 422
                const error = new BadRequestError(message, status, requestId)
                await logError(message, {id: this.id, executionId, tenantId, requestId, token, executionSource: "request"})
                res.status(404)
                res.json(error)
            }
        })  
    }
}

export default Flow