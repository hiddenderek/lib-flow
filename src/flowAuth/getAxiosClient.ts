import axios from "axios"
import config from "../config"
import { getToken } from "./getToken"

export async function getAxiosClient(token?: string) {
    if (!token) {
        const {access_token} = await getToken()
        token = access_token
    }
    const axiosClient = axios.create({
        baseURL: process.env.API_GATEWAY_URL || `http://${config.host.hostname}:${config.host.port}`,
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    return axiosClient
}