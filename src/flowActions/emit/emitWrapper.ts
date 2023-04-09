export const emitWrapper = (name: string, payload?: Record<string, any>, tracked?: boolean) => {
    return {__flowAction__: 'emit', name, payload, tracked}
}