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
// generateImage request — JSON body sent to AI_GATEWAY_URL/generateImage
// ---------------------------------------------------------------------------

// One image on the wire, in or out. Base64 rather than a data URI so the
// media type is a field the schema can see rather than a prefix someone has
// to parse.
const ImageDataSchema = z.object({
  base64: z.string(),
  mediaType: z.string(),
});

// Unlike generateText, this endpoint speaks to an image model
// (ImageModelV3), not a language model: no messages, no temperature, no
// tools. `images` and `mask` turn the call into an edit of what is sent.
const GatewayGenerateImageRequestV1Schema = z.object({
  model: z.string(),
  token: z.string(),
  prompt: z.string(),
  // Draw over these instead of from scratch. Absent for a fresh generation.
  images: z.array(ImageDataSchema).optional(),
  // Which region of `images` to redraw; meaningless without them.
  mask: ImageDataSchema.optional(),
  n: z.number().optional(),
  // `{width}x{height}`, per the SDK. Providers accept their own sets.
  size: z.string().optional(),
  // Honored only by providers that support it; OpenAI's image models warn
  // and ignore. See the AI SDK's ImageModelV3 warnings.
  seed: z.number().optional(),
  // Provider-specific body parameters, keyed by provider name, passed
  // through untouched (e.g. OpenAI's background, output_format, quality).
  providerOptions: z.record(z.record(z.unknown())).optional(),
});

// ---------------------------------------------------------------------------
// generateImage response — JSON body returned from
// AI_GATEWAY_URL/generateImage
// ---------------------------------------------------------------------------

// Per-call provider metadata. An image call can fan out into several
// provider requests (n greater than the model's per-call maximum), so this
// is an array where generateText has a single object, and it carries no
// `id` — ImageModelV3 does not report one.
const ImageResponseMetaSchema = z.object({
  timestamp: z.string(), // Date serialised to ISO string over JSON
  modelId: z.string(),
  headers: z.record(z.string()).optional(),
});

export const GatewayGenerateImageResponseV1Schema = z.object({
  // At least one image, or the call should have failed: the SDK throws
  // NoImageGeneratedError rather than returning an empty list.
  images: z.array(ImageDataSchema),
  warnings: z.array(z.unknown()).optional(),
  // Image models bill in tokens on some providers and per image on others;
  // every field is optional because a provider may report none of them.
  usage: z
    .object({
      inputTokens: z.number().optional(),
      outputTokens: z.number().optional(),
      totalTokens: z.number().optional(),
    })
    .optional(),
  responses: z.array(ImageResponseMetaSchema).optional(),
  // Provider-specific per-image details (OpenAI reports revisedPrompt,
  // size, quality, background, outputFormat here). Shape is the provider's,
  // so it stays unknown.
  providerMetadata: z.record(z.unknown()).optional(),
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
// Exported inferred types — use these in runtime code instead of hand-rolling
// parallel type definitions.
// ---------------------------------------------------------------------------

export type GatewayGenerateTextRequestV1 = z.infer<
  typeof GatewayGenerateTextRequestV1Schema
>;
export type GatewayGenerateTextResponseV1 = z.infer<
  typeof GatewayGenerateTextResponseV1Schema
>;
export type GatewayGenerateImageRequestV1 = z.infer<
  typeof GatewayGenerateImageRequestV1Schema
>;
export type GatewayGenerateImageResponseV1 = z.infer<
  typeof GatewayGenerateImageResponseV1Schema
>;
export type GatewayTranscribeRequestV1 = z.infer<
  typeof GatewayTranscribeRequestV1Schema
>;
export type GatewayTranscribeResponseV1 = z.infer<
  typeof GatewayTranscribeResponseV1Schema
>;

// ---------------------------------------------------------------------------
// Versioned schema maps — the authoritative list of "what versions exist".
// Adding a new version here is all that is needed to get it picked up by
// the contract test and the update script.
// ---------------------------------------------------------------------------

export const generateTextRequestSchemas: Record<number, z.ZodTypeAny> = {
  1: GatewayGenerateTextRequestV1Schema,
};

export const generateTextResponseSchemas: Record<number, z.ZodTypeAny> = {
  1: GatewayGenerateTextResponseV1Schema,
};

export const generateImageRequestSchemas: Record<number, z.ZodTypeAny> = {
  1: GatewayGenerateImageRequestV1Schema,
};

export const generateImageResponseSchemas: Record<number, z.ZodTypeAny> = {
  1: GatewayGenerateImageResponseV1Schema,
};

export const transcribeRequestSchemas: Record<number, z.ZodTypeAny> = {
  1: GatewayTranscribeRequestV1Schema,
};

export const transcribeResponseSchemas: Record<number, z.ZodTypeAny> = {
  1: GatewayTranscribeResponseV1Schema,
};

export const ALL_GATEWAY_SCHEMA_GROUPS: Record<
  string,
  Record<number, z.ZodTypeAny>
> = {
  generateTextRequest: generateTextRequestSchemas,
  generateTextResponse: generateTextResponseSchemas,
  generateImageRequest: generateImageRequestSchemas,
  generateImageResponse: generateImageResponseSchemas,
  transcribeRequest: transcribeRequestSchemas,
  transcribeResponse: transcribeResponseSchemas,
};

// ---------------------------------------------------------------------------
// Current schema version — import this on the client to pin the version sent
// in X-AI-Gateway-Schema-Version request headers. Bump this alongside
// CURRENT_VERSION in the worker's src/contract/version.ts when a new schema
// version is introduced.
// ---------------------------------------------------------------------------

export const CURRENT_SCHEMA_VERSION = '1' as const;
