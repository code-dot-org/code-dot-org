import z from 'zod/v3';

// ---------------------------------------------------------------------------
// Shared sub-schemas
// ---------------------------------------------------------------------------

// Basic message envelope — role is one of the four SDK roles, content is
// left as unknown because it can be a plain string or a complex multimodal
// array (TextPart | FilePart | ...) depending on the role.
const MessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant', 'tool']),
  content: z.unknown(),
});

// The serialized form of an Output schema as sent through the gateway.
// aiSdkCompatibleGateway#serializeOutputSchema converts Output.object() into
// this shape before JSON-encoding the request.
const SerializedOutputRequestSchema = z.object({
  type: z.string(),
  schema: z.record(z.unknown()).optional(),
});

// Common envelope for a tool call.  Tool-specific input is unknown/generic
// because its shape depends on the tool definition.
const ToolCallSchema = z.object({
  toolCallId: z.string(),
  toolName: z.string(),
  input: z.unknown(),
});

// Common envelope for a tool result.
const ToolResultSchema = z.object({
  toolCallId: z.string(),
  toolName: z.string(),
  input: z.unknown(),
  output: z.unknown(),
});

// Provider-response metadata returned alongside the generation result.
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
  // The concrete shape depends on the caller-supplied schema, so it remains
  // unknown here.  Callers cast it (e.g. `output as {classification: string}`).
  output: z.unknown().optional(),
  toolCalls: z.array(ToolCallSchema).optional(),
  toolResults: z.array(ToolResultSchema).optional(),
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
