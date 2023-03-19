export type JsonSchemaToObject<T> = 
    T extends { type: 'string' }
    ? string
    : T extends { type: 'number' }
    ? number
    : T extends { type: 'boolean' }
    ? boolean
    : T extends { type: 'array'; items: infer U }
    ? JsonSchemaToObject<U>[]
    : T extends {
        type: 'object';
        properties: infer U;
        required?: infer R;
        additionalProperties?: infer A;
    }
    ? (R extends ReadonlyArray<string>
        ? { [K in keyof U]-?: K extends R[number] ? JsonSchemaToObject<U[K]> : JsonSchemaToObject<U[K]> | undefined }
        : { [K in keyof U]-?: JsonSchemaToObject<U[K]> | undefined }
    )
    & (A extends true
        ? { [key: string]: any }
        : {}
    )
    : never;
