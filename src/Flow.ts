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
                listen<typeof content.input>(event, this.input, this.body, this.id, 'queue', this.stateless )
            })
        }
        if (content?.triggers?.schedules) {
            content.triggers.schedules.forEach((schedule) => {
                const isValid = cron.validate(schedule)
                if (isValid) {
                    cron.schedule(schedule, async () => {
                        const {access_token}  = await getToken('exchange')
                        const requestId = uuidv4()
                        logMessage(`Running scheduled job for flow '${this.id}'`)
                        await flowRunner(this.input, {} as any, this.body, this.id, 'cron', this.stateless, access_token, requestId)
                    })
                } else {
                    console.error(`Invalid Cron Schedule '${schedule}'. Skipping.`)
                }
            })
        }
    }

    private router = express.Router()

    public makeRoute = () => {
        // @ts-ignore
        this.router.use(function timeLog(req , res, next) {
            next();
        });

        this.router[this.method ? this.method : 'post'](`/v${config.flow.version}/flow/start/${this.id}`, async(req: any, res: any) => {
            const authenticateToken = req.headers['authorization'] || ''
            const token = parseToken(authenticateToken)
            const requestId = uuidv4()
            const result = await flowRunner<typeof this.input>(this.input, req.body, this.body, this.id, 'request', this.stateless, token, requestId)
            res.status(result.status)
            res.json(result)
        })  
    }
}

export default Flow