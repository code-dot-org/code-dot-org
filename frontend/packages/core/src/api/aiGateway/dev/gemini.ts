// The gateway's work, done for a developer with their own Google key: a
// gateway request becomes a Gemini generateContent call, and Gemini's reply
// becomes the gateway's version 2 response. The gateway itself calls Vertex
// through the AI SDK; this calls the public Gemini API directly, and runs
// none of the gateway's checks.

export const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models';

type Part =
  | {type: 'text'; text: string}
  | {type: 'image'; image: string; mediaType?: string}
  | {type: 'file'; data: string; mediaType: string};

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string | Part[];
}

export interface GatewayRequest {
  model: string;
  token?: string;
  prompt?: string;
  system?: string;
  messages?: Message[];
  temperature?: number;
  seed?: number;
  maxTokens?: number;
  providerOptions?: {google?: {imageConfig?: object}};
  output?: {type: string; schema?: object};
}

type GeminiPart =
  | {text: string; thought?: boolean}
  | {inlineData: {mimeType: string; data: string}};

/** A data URL's type and base64 body; a bare string is taken as PNG base64. */
function inlineData(value: string, mediaType?: string) {
  const match = /^data:([^;,]+);base64,(.*)$/.exec(value);
  return match
    ? {mimeType: match[1], data: match[2]}
    : {mimeType: mediaType ?? 'image/png', data: value};
}

function geminiParts(content: string | Part[]): GeminiPart[] {
  if (typeof content === 'string') {
    return [{text: content}];
  }
  return content.map(part => {
    switch (part.type) {
      case 'text':
        return {text: part.text};
      case 'image':
        return {inlineData: inlineData(part.image, part.mediaType)};
      case 'file':
        return {inlineData: inlineData(part.data, part.mediaType)};
    }
  });
}

/** Gemini's generateContent body for a gateway request. */
export function geminiRequest(request: GatewayRequest): object {
  const system = [
    request.system,
    ...(request.messages ?? [])
      .filter(m => m.role === 'system')
      .map(m => m.content as string),
  ].filter(Boolean);
  const contents = [
    ...(request.messages ?? [])
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: geminiParts(m.content),
      })),
    ...(request.prompt
      ? [{role: 'user', parts: [{text: request.prompt}]}]
      : []),
  ];
  const imageConfig = request.providerOptions?.google?.imageConfig;
  const generationConfig = {
    ...(request.temperature !== undefined && {
      temperature: request.temperature,
    }),
    ...(request.seed !== undefined && {seed: request.seed}),
    ...(request.maxTokens !== undefined && {
      maxOutputTokens: request.maxTokens,
    }),
    ...(imageConfig && {imageConfig, responseModalities: ['TEXT', 'IMAGE']}),
    ...(request.output && {
      responseMimeType: 'application/json',
      ...(request.output.schema && {
        responseJsonSchema: request.output.schema,
      }),
    }),
  };
  return {
    contents,
    ...(system.length && {
      systemInstruction: {parts: [{text: system.join('\n\n')}]},
    }),
    generationConfig,
  };
}

interface GeminiResponse {
  candidates?: {
    content?: {parts?: GeminiPart[]};
    finishReason?: string;
  }[];
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  responseId?: string;
  modelVersion?: string;
}

// The AI SDK's names for Gemini's finish reasons.
const FINISH_REASONS: Record<string, string> = {
  STOP: 'stop',
  MAX_TOKENS: 'length',
  SAFETY: 'content-filter',
  RECITATION: 'content-filter',
  PROHIBITED_CONTENT: 'content-filter',
  IMAGE_SAFETY: 'content-filter',
};

/** The gateway's version 2 response for Gemini's reply to `request`. */
export function gatewayResponse(
  request: GatewayRequest,
  reply: GeminiResponse,
): object {
  const candidate = reply.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  const text = parts
    .filter(
      (p): p is {text: string} =>
        'text' in p && !(p as {thought?: boolean}).thought,
    )
    .map(p => p.text)
    .join('');
  const files = parts
    .filter(
      (p): p is {inlineData: {mimeType: string; data: string}} =>
        'inlineData' in p,
    )
    .map(p => ({mediaType: p.inlineData.mimeType, base64: p.inlineData.data}));
  let output: unknown;
  if (request.output && text) {
    try {
      output = JSON.parse(text);
    } catch {
      output = undefined;
    }
  }
  const usage = reply.usageMetadata;
  return {
    text,
    finishReason:
      FINISH_REASONS[candidate?.finishReason ?? ''] ??
      (candidate ? 'other' : 'error'),
    ...(usage && {
      usage: {
        inputTokens: usage.promptTokenCount,
        outputTokens: usage.candidatesTokenCount,
        totalTokens: usage.totalTokenCount,
      },
    }),
    ...(output !== undefined && {output}),
    ...(files.length && {files}),
    response: {
      id: reply.responseId ?? 'dev',
      timestamp: new Date().toISOString(),
      modelId: reply.modelVersion ?? request.model,
      body: reply,
    },
  };
}
