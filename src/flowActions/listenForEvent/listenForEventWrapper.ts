export const listenForEventWrapper
 =  (name: string, timeout?: number ) : {__flowAction__: string, name: string} => {
    return {__flowAction__: "listenForEvent", name}
}