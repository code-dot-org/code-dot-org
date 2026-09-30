import {http, HttpResponse} from 'msw';

import {DEFAULT_AI_GATEWAY_URL} from '../aiGateway/aiGateway.api';

import {CANNED_IMAGE_PNG_BASE64} from './aiGateway.cannedImage';

// A stand-in for dashboard's token endpoint and the AI gateway, answering
// every call with a canned response: a sentence, the first value a requested
// output schema admits, or a prepared image when the call asks for one. A
// scenario overrides it by registering a route for AI_GATEWAY_MOCK_PATH.
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

interface GatewayRequest {
  model?: string;
  output?: {type: string; schema?: JsonSchema};
  providerOptions?: {google?: {imageConfig?: unknown}};
}

function asksForImage(body: GatewayRequest): boolean {
  return (
    !!body.providerOptions?.google?.imageConfig ||
    /image/.test(body.model ?? '')
  );
}

/** The gateway's reply to `body`, in its version 2 wire shape. */
export function cannedGatewayResponse(body: GatewayRequest) {
  const response = {
    id: 'mock-response',
    timestamp: new Date().toISOString(),
    modelId: body.model ?? 'mock',
  };
  if (asksForImage(body)) {
    return {
      text: '',
      finishReason: 'stop',
      files: [{mediaType: 'image/png', base64: CANNED_IMAGE_PNG_BASE64}],
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
      cannedGatewayResponse((await request.json()) as GatewayRequest),
    ),
  ),
];
