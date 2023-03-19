import axios from "axios"
import config from "../config"
import { getToken } from "./getToken"

export async function getAxiosClient() {
    const {access_token} = await getToken()
    const axiosClient = axios.create({
        baseURL: `http://${config.host.hostname}:${config.host.port}`,
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    })
    return axiosClient
}