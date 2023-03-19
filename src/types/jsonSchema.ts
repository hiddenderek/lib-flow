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

