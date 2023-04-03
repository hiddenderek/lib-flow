import axios, { AxiosResponse } from "axios"
import config from "../config"

export async function getToken(type?: 'oauth' | 'exchange'): Promise<{access_token: string}> {
    // TODO: disable this return and research authentication further
    return {access_token: 'asdf1234hi'}
    const baseURL = process.env.API_GATEWAY_URL || `http://${config.host.hostname}:${config.host.port}`
    const token: AxiosResponse<{access_token: string}> = await axios.post(
        `${baseURL}${type === "oauth" || type === undefined ? "/v4/iam/oauth2/token" : "/v4/iam/exchange"}`,
        {
            client_id: process.env.CLIENT_ID || 'local-client-id',
            client_secret: process.env.CLIENT_SECRET || 'super-client-secret',
            realm: process.env.CLIENT_REALM || 'default',
            grant_type: "client_credentials",
            scope: "openid",
            tenant: "nelnet"
        },
        {
            headers: {
                "Content-Type": 'application/json'
            }
        }
    )
    return token.data
}