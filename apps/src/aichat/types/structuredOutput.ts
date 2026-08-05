export interface ResponseSchemaSettings {
  jsonSchema: JsonObjectSchema;
  // Only ever invoked for a jsonSchema-configured session, so it always
  // receives the parsed structured output -- never a raw string. Parsing
  // (both paths' string forms) happens once, at the call site in
  // submitChatContents, not here.
  jsonSchemaResponseCallback: (response: unknown) => string;
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
