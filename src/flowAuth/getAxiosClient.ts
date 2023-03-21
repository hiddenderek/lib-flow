import axios from "axios"
import config from "../config"
import { getToken } from "./getToken"

export async function getAxiosClient(secret: string) {
    const {access_token} = await getToken(secret)
    const axiosClient = axios.create({
        baseURL: process.env.API_GATEWAY_URL || `http://${config.host.hostname}:${config.host.port}`,
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    })
    return axiosClient
}