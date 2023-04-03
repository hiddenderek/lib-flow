export const waitForEventWrapper =  (name: string, timeout?: number ) : {__flowAction__: string, name: string, timeout?: number} => {
    return {__flowAction__: "waitForEvent", name, timeout}
}