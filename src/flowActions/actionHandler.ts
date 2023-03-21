import { IEmitAction } from "../interfaces/IEmitAction";
import { IEmitMany } from "../interfaces/IEmitMany";
import { IActionHandler } from "../interfaces/IActionHandler";
import { emitAction } from "./emit/emitAction";
import { emitManyAction } from "./emitMany/emitManyAction";

export const actionHandler = async (input: IActionHandler) => {
    const {flowAction, ...values} = JSON.parse(JSON.stringify(input)) as IActionHandler
    console.log('ACTON: '  + flowAction)
    switch (flowAction) {
        case 'emit': 
            await emitAction(values as IEmitAction)
            break;
        case 'emitMany': 
            await emitManyAction(values as IEmitMany)
            break;
        default:
            console.info('No supported action found')
    }
}