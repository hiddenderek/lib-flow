export const emitManyWrapper = (events: Event[]) => {
    return {__flowAction__: 'emitMany', events}
}