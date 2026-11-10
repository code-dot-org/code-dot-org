// The AI gateway (code-dot-org/ai-gateway), a Cloudflare Worker that calls
// model providers for the browser. Dashboard signs a short-lived token for
// each call. Ported from apps/src/aiGateway; Turnstile, which the gateway
// can demand of a call, is not ported yet.

import type {Transport} from '../transports/types';

import {
  CURRENT_SCHEMA_VERSION,
  CurrentGatewayGenerateTextResponseSchema,
  type CurrentGatewayGenerateTextResponse,
} from './contract/gatewaySchemas';

export const DEFAULT_AI_GATEWAY_URL = 'https://ai-gateway.code.org';

/**
 * Where generateText posts: VITE_AI_GATEWAY_URL when set, such as a dev
 * server's local-key proxy, else the production gateway. A path is on the
 * page's own server, not dashboard's, so it is made absolute here.
 */
export function aiGatewayUrl(): string {
  const url = import.meta.env?.VITE_AI_GATEWAY_URL || DEFAULT_AI_GATEWAY_URL;
  const page = globalThis.location?.origin;
  return url.startsWith('/') && page ? new URL(url, page).toString() : url;
}

/** Which stage of a feature a call serves; the worker logs and meters by it. */
export type GatewayPhase =
  | 'input_filter'
  | 'generation'
  | 'output_filter'
  | 'llm_safety_judge';

export const TURNSTILE_ENFORCEMENT_MODES = [
  'disabled',
  'monitor',
  'enforce',
] as const;
export type TurnstileEnforcementMode =
  (typeof TURNSTILE_ENFORCEMENT_MODES)[number];

/** Anything unrecognized is 'disabled', as in apps. */
export function parseTurnstileEnforcementMode(
  value: unknown,
): TurnstileEnforcementMode {
  return (TURNSTILE_ENFORCEMENT_MODES as readonly unknown[]).includes(value)
    ? (value as TurnstileEnforcementMode)
    : 'disabled';
}

export interface GatewayAccessToken {
  /** A signed JWT, valid for a minute, sent with one gateway call. */
  token: string;
  turnstileEnforcementMode: TurnstileEnforcementMode;
}

type ContentPart =
  | {type: 'text'; text: string}
  | {type: 'image'; image: string}
  | {type: 'file'; data: string; mediaType: string; filename?: string};

export interface GatewayMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ContentPart[];
}

/** The AI SDK's generateText options, as they cross the wire. */
export interface GatewayGenerateTextOptions {
  /** The provider's model id, e.g. 'gemini-2.5-flash'. */
  model: string;
  prompt?: string;
  system?: string;
  messages?: GatewayMessage[];
  temperature?: number;
  seed?: number;
  maxTokens?: number;
  providerOptions?: Record<string, unknown>;
  /** A structured-output spec: {type, schema} with a JSON Schema. */
  output?: {type: string; schema?: unknown};
}

export interface GatewayFile {
  mediaType: string;
  base64: string;
  uint8Array: Uint8Array;
}

export type GatewayGenerateTextResult = Omit<
  CurrentGatewayGenerateTextResponse,
  'files'
> & {text: string; files: GatewayFile[]};

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

export function createAiGatewayApi(transport: Transport) {
  const api = {
    /** POST /ai_gateway/access_token: a token for one gateway call. */
    async getAccessToken(
      params: {aichatContext?: unknown} = {},
    ): Promise<GatewayAccessToken> {
      const value = await transport.request<{
        token: string;
        turnstileEnforcementMode?: unknown;
      }>({
        method: 'POST',
        url: '/ai_gateway/access_token',
        body: {aichatContext: params.aichatContext},
      });
      return {
        token: value.token,
        turnstileEnforcementMode: parseTurnstileEnforcementMode(
          value.turnstileEnforcementMode,
        ),
      };
    },

    /** POST to the gateway: one generateText call, with a fresh token. */
    async generateText(
      options: GatewayGenerateTextOptions,
      extra: {phase?: GatewayPhase; aichatContext?: unknown} = {},
    ): Promise<GatewayGenerateTextResult> {
      const {token, turnstileEnforcementMode} = await api.getAccessToken({
        aichatContext: extra.aichatContext,
      });
      if (turnstileEnforcementMode === 'enforce') {
        throw new Error(
          'The AI gateway requires a Turnstile token, which this client cannot solve yet.',
        );
      }
      const raw = await transport.request<unknown>({
        method: 'POST',
        url: aiGatewayUrl(),
        headers: {
          'X-AI-Gateway-Schema-Version': CURRENT_SCHEMA_VERSION,
          ...(extra.phase && {'x-ai-gateway-phase': extra.phase}),
        },
        body: {...options, token},
      });
      const wire = CurrentGatewayGenerateTextResponseSchema.parse(raw);
      return {
        ...wire,
        text: wire.text ?? '',
        files: (wire.files ?? []).map(file => ({
          ...file,
          uint8Array: base64ToBytes(file.base64),
        })),
      };
    },
  };
  return api;
}
