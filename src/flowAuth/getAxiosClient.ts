import axios from "axios"
import config from "../config"
import { getToken } from "./getToken"

export async function getAxiosClient() {
    const {access_token} = await getToken()
    const axiosClient = axios.create({
        baseURL: config.callService.baseUrl,
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    })
    return axiosClient
}