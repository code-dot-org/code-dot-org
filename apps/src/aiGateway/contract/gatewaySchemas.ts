import z from 'zod/v3';

// ---------------------------------------------------------------------------
// Message content parts
// ---------------------------------------------------------------------------

// A plain text part — the most common message content type.
const TextPartSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
});

// A file part (image or document) — `data` is always a base64 string after
// assetToFilePart() serialises the binary.
const FilePartSchema = z.object({
  type: z.literal('file'),
  data: z.string(), // base64-encoded file contents
  mediaType: z.string(),
  filename: z.string().optional(),
});

// System messages always carry a plain string.
const SystemMessageSchema = z.object({
  role: z.literal('system'),
  content: z.string(),
});

// User and assistant messages carry either a plain string or an array of
// content parts (text + optional file attachments).
const ContentPartsSchema = z.union([
  z.string(),
  z.array(z.union([TextPartSchema, FilePartSchema])),
]);

const UserMessageSchema = z.object({
  role: z.literal('user'),
  content: ContentPartsSchema,
});

const AssistantMessageSchema = z.object({
  role: z.literal('assistant'),
  content: ContentPartsSchema,
});

const MessageSchema = z.union([
  SystemMessageSchema,
  UserMessageSchema,
  AssistantMessageSchema,
]);

// ---------------------------------------------------------------------------
// JSON Schema meta-schema (draft-07)
// ---------------------------------------------------------------------------

// A compiled JSON Schema document as produced by zod-to-json-schema.
// The AI SDK's serializeOutputSchema() converts Output.object() into this
// shape before the request travels over the wire.  We validate it here so
// the gateway contract test can catch regressions.
//
// The schema is recursive (properties values are themselves JSON Schema
// documents), so we use z.lazy() and declare the TypeScript type explicitly
// to satisfy the compiler.
type JsonSchemaValue =
  | boolean
  | {
      type?: string | string[];
      properties?: Record<string, JsonSchemaValue>;
      required?: string[];
      additionalProperties?: boolean | JsonSchemaValue;
      items?: JsonSchemaValue | JsonSchemaValue[];
      enum?: unknown[];
      const?: unknown;
      anyOf?: JsonSchemaValue[];
      oneOf?: JsonSchemaValue[];
      allOf?: JsonSchemaValue[];
      not?: JsonSchemaValue;
      if?: JsonSchemaValue;
      then?: JsonSchemaValue;
      else?: JsonSchemaValue;
      $ref?: string;
      $schema?: string;
      $defs?: Record<string, JsonSchemaValue>;
      description?: string;
      title?: string;
      format?: string;
      minimum?: number;
      maximum?: number;
      exclusiveMinimum?: number;
      exclusiveMaximum?: number;
      minLength?: number;
      maxLength?: number;
      minItems?: number;
      maxItems?: number;
      pattern?: string;
      default?: unknown;
    };

const JsonSchemaDocumentSchema: z.ZodType<JsonSchemaValue> = z.lazy(() =>
  z.union([
    z.boolean(),
    z.object({
      type: z.union([z.string(), z.array(z.string())]).optional(),
      properties: z.record(JsonSchemaDocumentSchema).optional(),
      required: z.array(z.string()).optional(),
      additionalProperties: z
        .union([z.boolean(), JsonSchemaDocumentSchema])
        .optional(),
      items: z
        .union([JsonSchemaDocumentSchema, z.array(JsonSchemaDocumentSchema)])
        .optional(),
      enum: z.array(z.unknown()).optional(),
      const: z.unknown().optional(),
      anyOf: z.array(JsonSchemaDocumentSchema).optional(),
      oneOf: z.array(JsonSchemaDocumentSchema).optional(),
      allOf: z.array(JsonSchemaDocumentSchema).optional(),
      not: JsonSchemaDocumentSchema.optional(),
      if: JsonSchemaDocumentSchema.optional(),
      then: JsonSchemaDocumentSchema.optional(),
      else: JsonSchemaDocumentSchema.optional(),
      $ref: z.string().optional(),
      $schema: z.string().optional(),
      $defs: z.record(JsonSchemaDocumentSchema).optional(),
      description: z.string().optional(),
      title: z.string().optional(),
      format: z.string().optional(),
      minimum: z.number().optional(),
      maximum: z.number().optional(),
      exclusiveMinimum: z.number().optional(),
      exclusiveMaximum: z.number().optional(),
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      minItems: z.number().optional(),
      maxItems: z.number().optional(),
      pattern: z.string().optional(),
      default: z.unknown().optional(),
    }),
  ])
);

// ---------------------------------------------------------------------------
// Other request sub-schemas
// ---------------------------------------------------------------------------

// The serialized form of an Output schema as sent through the gateway.
// aiSdkCompatibleGateway#serializeOutputSchema converts Output.object() into
// {type, schema} where `schema` is a compiled JSON Schema draft-07 document.
const SerializedOutputRequestSchema = z.object({
  type: z.string(),
  schema: JsonSchemaDocumentSchema.optional(),
});

// ---------------------------------------------------------------------------
// Provider-response metadata
// ---------------------------------------------------------------------------

// Raw provider-response metadata returned alongside the generation result.
// The `body` field carries the raw HTTP body from the LLM provider — its
// shape is provider-specific (e.g. Gemini puts moderation details in
// body.candidates[0].finishReason/finishMessage).
const ResponseMetaSchema = z.object({
  id: z.string(),
  timestamp: z.string(), // Date serialised to ISO string over JSON
  modelId: z.string(),
  headers: z.record(z.string()).optional(),
  body: z.unknown().optional(),
});

// ---------------------------------------------------------------------------
// generateText request — JSON body sent to AI_GATEWAY_URL
// ---------------------------------------------------------------------------

const GatewayGenerateTextRequestV1Schema = z.object({
  model: z.string(),
  token: z.string(),
  prompt: z.string().optional(),
  messages: z.array(MessageSchema).optional(),
  system: z.string().optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  // Serialized structured-output spec (see SerializedOutputRequestSchema).
  output: SerializedOutputRequestSchema.optional(),
});

// ---------------------------------------------------------------------------
// generateText response — JSON body returned from AI_GATEWAY_URL
// ---------------------------------------------------------------------------

export const GatewayGenerateTextResponseV1Schema = z.object({
  text: z.string().optional(),
  finishReason: z.string(),
  // usage is optional: some providers don't report token counts at all.
  // promptTokens/completionTokens are deprecated SDK v6 aliases for
  // inputTokens/outputTokens — providers may omit them entirely.
  usage: z
    .object({
      promptTokens: z.number().optional(),
      completionTokens: z.number().optional(),
      totalTokens: z.number().optional(),
      inputTokens: z.number().optional(),
      outputTokens: z.number().optional(),
    })
    .optional(),
  // Parsed structured output when the request included an `output` schema.
  // The concrete shape is determined per-callsite by the OUTPUT generic of
  // generateText — the wire contract can't capture it, so it stays unknown.
  // Callers access it via the SDK's typed return value (e.g. result.output
  // is inferred as {classification: 'OK' | 'INAPPROPRIATE'} in safetyHelpers).
  output: z.unknown().optional(),
  warnings: z.array(z.unknown()).optional(),
  files: z
    .array(
      z.object({
        mediaType: z.string(),
        base64: z.string(),
      })
    )
    .optional(),
  // Raw provider-response metadata — present on every response.
  // Accessing response.body is intentional for provider-specific fields
  // (e.g. Gemini moderation details live in body.candidates[0]).
  response: ResponseMetaSchema.optional(),
});

// ---------------------------------------------------------------------------
// transcribe request — logical shape of the FormData fields sent to
// AI_GATEWAY_URL/transcribe (audio itself is not schema-validated here)
// ---------------------------------------------------------------------------

const GatewayTranscribeRequestV1Schema = z.object({
  token: z.string(),
  model: z.string(),
  audio: z.unknown(),
});

// ---------------------------------------------------------------------------
// transcribe response — JSON body returned from AI_GATEWAY_URL/transcribe
// ---------------------------------------------------------------------------

export const GatewayTranscribeResponseV1Schema = z.object({
  text: z.string(),
  segments: z.array(z.unknown()).optional(),
  language: z.string().optional(),
  durationInSeconds: z.number().optional(),
  warnings: z.array(z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// Schema version 2
// ---------------------------------------------------------------------------
//
// V2 adds `responseSignature` to the generateText response. Nothing else
// changes, but a version covers the whole API rather than one endpoint: the
// worker calls resolveVersion() once per request and then looks up a serializer
// by that version, so an endpoint left without a V2 entry would be an undefined
// lookup for any V2 client. The unchanged shapes are therefore re-exported
// under V2 rather than omitted.

export const GatewayGenerateTextResponseV2Schema =
  GatewayGenerateTextResponseV1Schema.extend({
    // Detached signature over the response: a compact JWS (RS256) signed with
    // the worker's private key, carrying digests and binding claims only. The
    // response itself travels unchanged in `text` above, so it stays
    // independently verifiable -- dashboard recomputes the digest from what the
    // browser submits and compares. See dashboard's AichatResponseSignature.
    //
    // Optional because the worker returns no signature when it has no signing
    // key configured, and none is available for the finish reasons that
    // withhold `text`.
    responseSignature: z.string().optional(),
  });

const GatewayGenerateTextRequestV2Schema = GatewayGenerateTextRequestV1Schema;
const GatewayTranscribeRequestV2Schema = GatewayTranscribeRequestV1Schema;
export const GatewayTranscribeResponseV2Schema =
  GatewayTranscribeResponseV1Schema;

// ---------------------------------------------------------------------------
// Exported inferred types — use these in runtime code instead of hand-rolling
// parallel type definitions.
// ---------------------------------------------------------------------------

export type GatewayGenerateTextRequestV1 = z.infer<
  typeof GatewayGenerateTextRequestV1Schema
>;
export type GatewayGenerateTextResponseV1 = z.infer<
  typeof GatewayGenerateTextResponseV1Schema
>;
export type GatewayTranscribeRequestV1 = z.infer<
  typeof GatewayTranscribeRequestV1Schema
>;
export type GatewayTranscribeResponseV1 = z.infer<
  typeof GatewayTranscribeResponseV1Schema
>;
export type GatewayGenerateTextResponseV2 = z.infer<
  typeof GatewayGenerateTextResponseV2Schema
>;
export type GatewayTranscribeResponseV2 = z.infer<
  typeof GatewayTranscribeResponseV2Schema
>;

// ---------------------------------------------------------------------------
// Versioned schema maps — the authoritative list of "what versions exist".
// Adding a new version here is all that is needed to get it picked up by
// the contract test and the update script.
// ---------------------------------------------------------------------------

export const generateTextRequestSchemas: Record<number, z.ZodTypeAny> = {
  1: GatewayGenerateTextRequestV1Schema,
  2: GatewayGenerateTextRequestV2Schema,
};

export const generateTextResponseSchemas: Record<number, z.ZodTypeAny> = {
  1: GatewayGenerateTextResponseV1Schema,
  2: GatewayGenerateTextResponseV2Schema,
};

export const transcribeRequestSchemas: Record<number, z.ZodTypeAny> = {
  1: GatewayTranscribeRequestV1Schema,
  2: GatewayTranscribeRequestV2Schema,
};

export const transcribeResponseSchemas: Record<number, z.ZodTypeAny> = {
  1: GatewayTranscribeResponseV1Schema,
  2: GatewayTranscribeResponseV2Schema,
};

export const ALL_GATEWAY_SCHEMA_GROUPS: Record<
  string,
  Record<number, z.ZodTypeAny>
> = {
  generateTextRequest: generateTextRequestSchemas,
  generateTextResponse: generateTextResponseSchemas,
  transcribeRequest: transcribeRequestSchemas,
  transcribeResponse: transcribeResponseSchemas,
};

// ---------------------------------------------------------------------------
// Current schema version — import this on the client to pin the version sent
// in X-AI-Gateway-Schema-Version request headers. Bump this alongside
// CURRENT_VERSION in the worker's src/contract/version.ts when a new schema
// version is introduced.
// ---------------------------------------------------------------------------

export const CURRENT_SCHEMA_VERSION = '2' as const;

// ---------------------------------------------------------------------------
// Current-version response schemas — what the client should parse replies with.
//
// The client asks for CURRENT_SCHEMA_VERSION and must validate against the
// matching schema. Parsing with an older one silently drops the newer fields,
// because z.object() strips unknown keys and callers use the parsed result.
//
// These are separate exports rather than a lookup in the maps above so the
// inferred types survive: the maps are typed z.ZodTypeAny, which erases them.
// gatewaySchemaVersionTest.ts asserts each alias is the same schema the map
// holds for CURRENT_SCHEMA_VERSION, so the two cannot drift.
// ---------------------------------------------------------------------------

export const CurrentGatewayGenerateTextResponseSchema =
  GatewayGenerateTextResponseV2Schema;
export const CurrentGatewayTranscribeResponseSchema =
  GatewayTranscribeResponseV2Schema;

export type CurrentGatewayGenerateTextResponse = z.infer<
  typeof CurrentGatewayGenerateTextResponseSchema
>;
export type CurrentGatewayTranscribeResponse = z.infer<
  typeof CurrentGatewayTranscribeResponseSchema
>;
