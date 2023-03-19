import axios, { AxiosResponse } from "axios"
import config from "../config"

export async function getToken(): Promise<{access_token: string}> {
    const token: AxiosResponse<{access_token: string}> = await axios.post(
        `http://${config.host.hostname}:${config.host.port}/v4/iam/oauth2/token`,
        {
            client_id: "test_runner",
            client_secret: "super_secret",
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