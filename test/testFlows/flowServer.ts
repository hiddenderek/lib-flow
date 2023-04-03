import express from 'express'
import config from '../../src/config'
import processEnv from 'dotenv'
import { importFlows } from "../../src/index"

processEnv.config()
const app = express()
app.use(express.json({ limit: "2mb" }));
console.log('hi')
console.log('hiiii')


async function startServer(app: any) {
     await importFlows(app, __dirname, './')
     
     app.get('/*', async (req: any, res:  any) => {
          res.json({hi: 'bye'});
     })
 
     app.listen(config.host.port, function listenHandler() {
          console.info(`Running on ${config.host.port}`)
     })
}

startServer(app)


