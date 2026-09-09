export interface ResponseSchemaSettings {
  jsonSchema: JsonObjectSchema;

  /**
   * Renders a parsed structured response as the text shown to the reader.
   *
   * Must be pure. It runs on every message in the transcript, on every render,
   * including a teacher reading a student's history -- so a side effect here
   * fires once per historical message against whoever is looking.
   */
  formatForDisplay: (response: unknown) => string;

  /**
   * Optional callback to act on a structured response that just arrived.
   *
   * May perform side effects. Called once for the new response only, never when
   * loading the response from the stored history.
   */
  onResponse?: (response: unknown) => void;
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
