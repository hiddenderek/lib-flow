import axios from "axios"
import config from "../config"
import { getToken } from "./getToken"

export async function getAxiosClient(token?: string) {
    if (!token) {
        const { access_token } = await getToken()
        token = access_token
    }
    const axiosClient = axios.create({
        baseURL: `http://api-gateway:3000`,
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    return axiosClient
}