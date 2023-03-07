export type NumberSchema = {
    type: 'number' | 'integer'
}

export type StringSchema = {
    type: 'string' | 'email' | 'date-time' | 'date' | 'time' | 'uri';
    enum?: readonly string[]
}

export type BooleanSchema = {
    type: 'boolean'
}

export type NullSchema = {
    type: 'null'
}

export type ArraySchema = {
    type: 'array';
    items: JsonSchema;
}

export type ObjectSchema = {
    type: 'object';
    required?: readonly string[];
    additionalProperties?: JsonSchema | boolean;
    properties: {
        [key: string]: JsonSchema
    }
}

export type ValueSchema = ComplexSchema | PrimitveSchema


export type StringSchemaToType<T extends ValueSchema> = T extends StringSchema & {
    enum: infer E;
} ? E extends string[] ? E[number] : string : string

export type PrimitiveSchemaToType<T extends PrimitveSchema> = {
    null: null;
    boolean: boolean;
    number: number;
    integer : number;
    string: StringSchemaToType<T>;
    email:StringSchemaToType<T>;
    'date-time': StringSchemaToType<T>;
    date: StringSchemaToType<T>;
    time: StringSchemaToType<T>;
    uri: StringSchemaToType<T>;
}

// where the magic happens

export type ComplexSchemaToType<T extends ComplexSchema> = T extends ArraySchema ? Array<JsonSchemaToType<T>> : T extends ObjectSchema & {
    required?: infer R;
    additionalProperties?: infer A;
} ? {
    [K in keyof T['properties']] : JsonSchemaToType<T['properties'][K]>
} & (A extends JsonSchema ? {
    [key:string]: JsonSchemaToType<A>;
} : A extends true ? {
    [key: string] : any
}: {}) : any

export type ValueSchemaToType<T extends ValueSchema> = T extends ComplexSchema ? ComplexSchemaToType<T> : T extends PrimitveSchema ? PrimitiveSchemaToType<T>[T['type']] : any

export type OperatorSchemaToType<T extends OperatorSchema> = T extends AnyOfSchema ? ValueSchemaToType<T['anyOf'][number]> : T extends AllOfSchema ? UnionToIntersection<ValueSchemaToType<T['allOf'][number]>> : T extends OneOfSchema ? ValueSchemaToType<T['oneOf'][number]> : any

type UnionToIntersection<U> = (U extends any ? (k: U) => void: never) extends (k: infer I) => void ? I : never

export type AnyOfSchema = {
    anyOf: readonly ValueSchema[]
}

export type AllOfSchema = {
    allOf: readonly ValueSchema[]
}

export type OneOfSchema = {
    oneOf: readonly ValueSchema[]
}

export type NotSchema = {
    not: ValueSchema
}

export type OperatorSchema = AnyOfSchema | AllOfSchema | OneOfSchema | NotSchema

export type ComplexSchema = ArraySchema | ObjectSchema

export type PrimitveSchema = NumberSchema | StringSchema | BooleanSchema | NullSchema

export type JsonSchema = PrimitveSchema | ComplexSchema | OperatorSchema

export type JsonSchemaToType<T extends JsonSchema> = T extends ValueSchema ? ValueSchemaToType<T> : T extends OperatorSchema ? OperatorSchemaToType<T> : any;
