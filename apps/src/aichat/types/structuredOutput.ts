export interface ResponseSchemaSettings {
  jsonSchema: JsonObjectSchema;
  responseCallback: (response: string) => string;
}

export interface JsonObjectSchema {
  type: 'object';
  properties: JsonProperties;
  // The required array is optional in JsonSchema but required w/ OpenAI.
  required: string[];
  description?: string;
  additionalProperties: boolean;
  // propertyOrdering is only used by Gemini.
  propertyOrdering?: string[];
}

interface JsonProperties {
  [key: string]: JsonPrimitiveSchema | JsonArraySchema | JsonObjectSchema;
}

type JsonPrimitiveSchema =
  | JsonStringSchema
  | JsonNumberSchema
  | JsonBooleanSchema
  | JsonNullSchema;

interface JsonStringSchema {
  type: 'string';
  description?: string;
  enum?: string[];
}

interface JsonNumberSchema {
  type: 'number';
  description?: string;
  enum?: number[];
}

interface JsonBooleanSchema {
  type: 'boolean';
  description?: string;
}

interface JsonNullSchema {
  type: 'null';
  description?: string;
}

interface JsonArraySchema {
  type: 'array';
  items: JsonPrimitiveSchema | JsonArraySchema | JsonObjectSchema;
  description?: string;
}
