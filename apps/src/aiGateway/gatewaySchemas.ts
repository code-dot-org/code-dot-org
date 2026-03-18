import z from 'zod/v3';

// ---------------------------------------------------------------------------
// generateText request — JSON body sent to AI_GATEWAY_URL
// ---------------------------------------------------------------------------

const GatewayGenerateTextRequestV1Schema = z.object({
  model: z.string(),
  token: z.string(),
  prompt: z.string().optional(),
  messages: z.array(z.unknown()).optional(),
  system: z.string().optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  output: z.unknown().optional(),
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
  toolCalls: z.array(z.unknown()).optional(),
  toolResults: z.array(z.unknown()).optional(),
  warnings: z.array(z.unknown()).optional(),
  files: z
    .array(
      z.object({
        mediaType: z.string(),
        base64: z.string(),
      })
    )
    .optional(),
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
