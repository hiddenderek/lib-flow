import { IEmitAction } from "../interfaces/IEmitAction";
import { IEmitMany } from "../interfaces/IEmitMany";
import { emitAction } from "./emit/emitAction";
import { emitManyAction } from "./emitMany/emitManyAction";

export const actionHandler = async (input: {flowAction: string, [key:string] : any}) => {
    const {flowAction, ...values} = input
    switch (flowAction) {
        case 'emit': {
            await emitAction(values as IEmitAction)
            break;
        }
        case 'emitMany': {
            await emitManyAction(values as IEmitMany)
            break;
        }
    }
}