import { flow } from "./types/flow";
import express from 'express'
import {listen} from './listen'
import { flowRunner } from "./flowRunner";
import { JsonSchema } from "./types/jsonSchema";
import { parseToken } from "./utils/parseToken";
import config from "./config";

interface Flow<I> extends flow<I> {}

class Flow<I extends Readonly<JsonSchema>> {
    public constructor(content: flow<I>) {
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
    }

    private router = express.Router()

    public makeRoute = () => {
        this.router.use(function timeLog(req, res, next) {
            next();
        });

        this.router[this.method ? this.method : 'post'](`/v${config.flow.version}/flow/start/${this.id}`, async(req: any, res: any) => {
            const authenticateToken = req.headers['authorization'] || ''
            const token = parseToken(authenticateToken)
            const result = await flowRunner<typeof this.input>(this.input, req.body, this.body, this.id, 'request', this.stateless, token)
            res.status(result.status)
            res.json(result)
        })  
    }
}

export default Flow