import { IEmitAction } from "../interfaces/IEmitAction";
import { IEmitMany } from "../interfaces/IEmitMany";
import { IActionHandler } from "../interfaces/IActionHandler";
import { emitAction } from "./emit/emitAction";
import { emitManyAction } from "./emitMany/emitManyAction";

export const actionHandler = async (input: IActionHandler) => {
    const {__flowAction__, ...values} = JSON.parse(JSON.stringify(input)) as IActionHandler
    console.log('ACTON: '  + __flowAction__)
    switch (__flowAction__) {
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