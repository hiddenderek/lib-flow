
import { AxiosError } from "axios";
import { ICallServiceAction } from "../../interfaces/ICallServiceAction";
import { getAxiosClient } from "../../flowAuth/getAxiosClient";

export const callServiceAction = async (options: ICallServiceAction)  => {
    try {
        const axiosClient = await getAxiosClient()
        const nameFormat = options.name.replace('.', '/')
        await axiosClient[options.method ? options.method : "post"](nameFormat, options.params)
        return {status: 200, data: {}}
    } catch (e) {
        const error = e as AxiosError
        return {status: 500, data: error.response?.data}
    }
}