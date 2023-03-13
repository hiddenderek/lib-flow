export type PrimitiveSchema = NumberSchema | StringSchema | BooleanSchema | NullSchema;

export type StringSchema = {
    type: 'string' | 'email' | 'date-time' | 'date' | 'time' | 'uri';
    enum?: readonly string[];
};

export type NumberSchema = {
    type: 'number' | 'integer';
};

export type BooleanSchema = {
    type: 'boolean';
};

export type NullSchema = {
    type: 'null';
};


export type ComplexSchema = ArraySchema | ObjectSchema;

export type ArraySchema = {
    type: 'array';
    items: JsonSchema;
};

export type ObjectSchema = {
    type: 'object';
    required?: readonly string[];
    additionalProperties?: JsonSchema | boolean;
    properties: {
        [key: string]: JsonSchema;
    };
};

export type ValueSchema = ComplexSchema | PrimitiveSchema;

export type OperatorSchema = AnyOfSchema | AllOfSchema | OneOfSchema | NotSchema;

export type AnyOfSchema = {
    anyOf: readonly ValueSchema[];
};

export type AllOfSchema = {
    allOf: readonly ValueSchema[];
};

export type OneOfSchema = {
    oneOf: readonly ValueSchema[];
};

export type NotSchema = {
    not: ValueSchema;
};

export type JsonSchema = PrimitiveSchema | ComplexSchema | OperatorSchema;

export type JsonSchemaToType<T> = 
    T extends { type: 'string' }
    ? string
    : T extends { type: 'number' }
    ? number
    : T extends { type: 'boolean' }
    ? boolean
    : T extends { type: 'array'; items: infer U }
    ? JsonSchemaToType<U>[]
    : T extends {
        type: 'object';
        properties: infer U;
        required?: infer R;
        additionalProperties?: infer A;
    }
    ? (R extends ReadonlyArray<string>
        ? { [K in keyof U]-?: K extends R[number] ? JsonSchemaToType<U[K]> : JsonSchemaToType<U[K]> | undefined }
        : { [K in keyof U]-?: JsonSchemaToType<U[K]> | undefined }
    )
    & (A extends true
        ? { [key: string]: any }
        : {}
    )
    : never;

type PersonSchema = {
    type: "object",
    properties: {
        hi: {
            type: 'string'
        },
        numbers: {
            type: "number"
        }
    },
    required: ["hi"],
    additionalProperties: true,
}

type Person = JsonSchemaToType<PersonSchema>;