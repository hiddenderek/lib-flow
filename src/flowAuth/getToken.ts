import axios, { AxiosResponse } from "axios"
import config from "../config"

export async function getToken(secret: string): Promise<{access_token: string}> {
    const baseURL = process.env.API_GATEWAY_URL || `http://${config.host.hostname}:${config.host.port}`
    const token: AxiosResponse<{access_token: string}> = await axios.post(
        `${baseURL}/v4/iam/oauth2/token`,
        {
            client_id: "web-app",
            client_secret: secret,
            realm: "default",
            grant_type: "client_credentials",
            scope: "openid",
            tenant: "sfi"
        },
        {
            headers: {
                "Content-Type": 'application/json'
            }
        }
    )
    return token.data
}