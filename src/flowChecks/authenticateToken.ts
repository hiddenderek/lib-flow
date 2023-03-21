import axios, { AxiosResponse } from "axios"
import config from "src/config"

export const authenticateToken = async (token?: string) : Promise<'Success' | 'Null' | 'Error'> => {
    // TODO: disable this return and research authentication further
    return 'Success'

    if (!token) {
        return 'Null'
    }
    try {
        const baseURL = process.env.API_GATEWAY_URL || `http://${config.host.hostname}:${config.host.port}`
        const result: AxiosResponse<{active: boolean}> = await axios.post(
            `${baseURL}/v4/iam/introspect`,
            {
                token,
            },
            {
                headers: {
                    "Content-Type": 'application/json'
                }
            }
        )
        if (result.data?.active) {
            return 'Success'
        } else {
            return 'Error'
        }

    } catch (e) {
        return 'Error'
    }
}