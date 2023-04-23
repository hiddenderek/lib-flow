import axios, { AxiosResponse } from "axios"
import config from "../config"

export const authenticateToken = async (token?: string): Promise<'Success' | 'Null' | 'Error'> => {
    // TODO: disable this return 
    return 'Success'

    if (!token) {
        return 'Null'
    }
    try {
        const baseURL = `http://api-gateway:3000`
        const result: AxiosResponse<{ active: boolean }> = await axios.post(
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
        console.log('RESULT DATA: ' + JSON.stringify(result.data))
        if (result.data?.active) {
            return 'Success'
        } else {
            return 'Error'
        }

    } catch (e) {
        console.log('FAILED REQUESTING DATA')
        console.log(JSON.stringify(e))
        return 'Error'
    }
}