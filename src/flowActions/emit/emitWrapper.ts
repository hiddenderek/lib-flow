export const emitWrapper = (name: string, payload?: Record<string, any>) => {
    return {__flowAction__: 'emit', name, payload}
}