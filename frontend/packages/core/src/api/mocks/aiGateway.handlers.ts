import {http, HttpResponse} from 'msw';

import {DEFAULT_AI_GATEWAY_URL} from '../aiGateway/aiGateway.api';

import {CANNED_IMAGE_PNG_BASE64} from './aiGateway.cannedImage';
import {getActiveFixture} from './registry';

// A stand-in for dashboard's token endpoint and the AI gateway, answering
// every call with a canned response: a sentence, the first value a requested
// output schema admits, or a prepared image when the call asks for one. The
// image is the active fixture's first `aiImages` rule to match the prompt,
// else the edited image an edit request sends, else the canned character. A
// scenario replaces all of it by registering a route for AI_GATEWAY_MOCK_PATH.
// A gateway URL of a dev server's own (VITE_AI_GATEWAY_URL) passes by.

export const AI_GATEWAY_MOCK_PATH = `${DEFAULT_AI_GATEWAY_URL}/`;

export const CANNED_TEXT =
  'This is a canned response from the mock AI gateway.';

type JsonSchema = {
  type?: string | string[];
  enum?: unknown[];
  const?: unknown;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
};

/** The first value `schema` admits: an enum's first member, and so on. */
export function cannedValueFor(schema: JsonSchema | undefined): unknown {
  if (!schema) {
    return CANNED_TEXT;
  }
  if (schema.const !== undefined) {
    return schema.const;
  }
  if (schema.enum?.length) {
    return schema.enum[0];
  }
  const branch = schema.anyOf?.[0] ?? schema.oneOf?.[0];
  if (branch) {
    return cannedValueFor(branch);
  }
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  switch (type) {
    case 'object':
      return Object.fromEntries(
        Object.entries(schema.properties ?? {}).map(([key, value]) => [
          key,
          cannedValueFor(value),
        ]),
      );
    case 'array':
      return [];
    case 'number':
    case 'integer':
      return 0;
    case 'boolean':
      return false;
    case 'null':
      return null;
    default:
      return CANNED_TEXT;
  }
}

type MessagePart = {type: string; text?: string; image?: unknown};

export interface GatewayRequest {
  model?: string;
  prompt?: string;
  messages?: {role: string; content: string | MessagePart[]}[];
  output?: {type: string; schema?: JsonSchema};
  providerOptions?: {google?: {imageConfig?: unknown}};
}

/** The image a mock gateway returns for prompts a rule matches. */
export interface CannedImageRule {
  /** Tested against the request's text, every part joined by spaces. */
  match: RegExp | ((prompt: string, request: GatewayRequest) => boolean);
  /** A base64 data URL, as a `?inline` asset import gives. */
  image: string;
}

interface ImageFile {
  mediaType: string;
  base64: string;
}

const CANNED_IMAGE: ImageFile = {
  mediaType: 'image/png',
  base64: CANNED_IMAGE_PNG_BASE64,
};

function parts(body: GatewayRequest): MessagePart[] {
  return (body.messages ?? []).flatMap(message =>
    typeof message.content === 'string'
      ? [{type: 'text', text: message.content}]
      : message.content,
  );
}

/** The request's text: the prompt and every text part, joined by spaces. */
export function promptOf(body: GatewayRequest): string {
  return [
    body.prompt,
    ...parts(body)
      .filter(part => part.type === 'text')
      .map(part => part.text),
  ]
    .filter(Boolean)
    .join(' ');
}

function fromDataUrl(url: unknown): ImageFile | undefined {
  const match =
    typeof url === 'string' && /^data:([^;,]+);base64,(.*)$/s.exec(url);
  return match ? {mediaType: match[1], base64: match[2]} : undefined;
}

/** The image `body` should be answered with, under `rules`. */
export function cannedImageFor(
  body: GatewayRequest,
  rules: readonly CannedImageRule[] = [],
): ImageFile {
  const prompt = promptOf(body);
  for (const {match, image} of rules) {
    const matched =
      typeof match === 'function' ? match(prompt, body) : match.test(prompt);
    const file = matched && fromDataUrl(image);
    if (file) {
      return file;
    }
  }
  const sent = parts(body).find(part => part.type === 'image');
  return fromDataUrl(sent?.image) ?? CANNED_IMAGE;
}

function asksForImage(body: GatewayRequest): boolean {
  return (
    !!body.providerOptions?.google?.imageConfig ||
    /image/.test(body.model ?? '')
  );
}

/** The gateway's reply to `body`, in its version 2 wire shape. */
export function cannedGatewayResponse(
  body: GatewayRequest,
  rules: readonly CannedImageRule[] = [],
) {
  const response = {
    id: 'mock-response',
    timestamp: new Date().toISOString(),
    modelId: body.model ?? 'mock',
  };
  if (asksForImage(body)) {
    return {
      text: '',
      finishReason: 'stop',
      files: [cannedImageFor(body, rules)],
      response,
    };
  }
  if (body.output) {
    return {
      text: '',
      finishReason: 'stop',
      output: cannedValueFor(body.output.schema),
      response,
    };
  }
  return {text: CANNED_TEXT, finishReason: 'stop', response};
}

export const aiGatewayHandlers = [
  // Image moderation, which AI image features run on every picture: every
  // category at severity 0.
  http.post('*/v3/images/moderate', () =>
    HttpResponse.json({
      categoriesAnalysis: ['Hate', 'SelfHarm', 'Sexual', 'Violence'].map(
        category => ({category, severity: 0}),
      ),
    }),
  ),
  http.post('*/ai_gateway/access_token', () =>
    HttpResponse.json({
      token: 'mock-ai-gateway-token',
      turnstileEnforcementMode: 'disabled',
    }),
  ),
  http.post(AI_GATEWAY_MOCK_PATH, async ({request}) =>
    HttpResponse.json(
      cannedGatewayResponse(
        (await request.json()) as GatewayRequest,
        getActiveFixture()?.aiImages,
      ),
    ),
  ),
];
