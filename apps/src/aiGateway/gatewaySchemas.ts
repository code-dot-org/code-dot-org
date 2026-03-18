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
// Other request sub-schemas
// ---------------------------------------------------------------------------

// The serialized form of an Output schema as sent through the gateway.
// aiSdkCompatibleGateway#serializeOutputSchema converts Output.object() into
// this shape before JSON-encoding the request.
const SerializedOutputRequestSchema = z.object({
  type: z.string(),
  schema: z.record(z.unknown()).optional(),
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

const GatewayGenerateTextResponseV1Schema = z.object({
  text: z.string().optional(),
  finishReason: z.string(),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number().optional(),
  }),
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

const GatewayTranscribeResponseV1Schema = z.object({
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
  transcribeRequest: transcribeRequestSchemas,
  transcribeResponse: transcribeResponseSchemas,
};
