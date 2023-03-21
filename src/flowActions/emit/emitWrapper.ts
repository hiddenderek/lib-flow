export const emitWrapper = (name: string, payload: Record<string, any>) => {
    console.log('Wrapped!' + name)
    return {__flowAction__: 'emit', name, payload}
}