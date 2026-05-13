/**
 * Code.org AI Gateway client. Ported from `apps/src/aiGateway/`.
 *
 * The gateway accepts Vercel AI SDK `generateText` options (model, messages,
 * system, tools, structured output schema, …) plus an access token, and
 * returns a Vercel-shaped response. This file wraps the HTTP call so callers
 * keep using the SDK's `generateText` signature.
 *
 * NOTE on polling: the gateway is a one-shot POST. It does NOT poll. Long
 * tutor conversations should go through `postAichatCompletionMessage` in
 * `./aichatApi.ts`, which is the start-then-poll path the legacy AI Tutor
 * uses to survive completions that exceed HTTP timeouts.
 */

import {generateText, type GenerateTextResult} from 'ai';

export const AI_GATEWAY_URL = 'https://ai-gateway.code.org';
export const ACCESS_TOKEN_PATH = '/ai_gateway/access_token';

// The SDK's option shape. We accept anything the SDK accepts and forward.
type SDKOptions = Parameters<typeof generateText>[0];
type SDKTools = NonNullable<SDKOptions['tools']>;
type SDKOutput = NonNullable<SDKOptions['output']>;

/**
 * Wire shape returned by the gateway — `GenerateTextResult` modulo
 * `text` (a plain string here, not streamable) and `files` (base64 instead
 * of a Uint8Array).
 */
type SerializableAIResponse<
  TOOLS extends SDKTools = SDKTools,
  OUTPUT extends SDKOutput = SDKOutput,
> = Omit<GenerateTextResult<TOOLS, OUTPUT>, 'text' | 'files'> & {
  text?: string;
  files?: {mediaType: string; base64: string}[];
};

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  return Uint8Array.from(binaryString, char => char.charCodeAt(0));
};

/**
 * Async-unwrap the SDK's lazy `output.responseFormat` promise so the gateway
 * receives a plain JSON schema. The legacy code does this verbatim;
 * reproducing it keeps tool/structured-output features working.
 */
const serializeOutputSchema = async (output?: SDKOptions['output']) => {
  if (!output) return output;

  const safeOutput = output as unknown as Record<string, unknown>;
  if (
    typeof safeOutput === 'object' &&
    safeOutput !== null &&
    'responseFormat' in safeOutput
  ) {
    const format = await (safeOutput.responseFormat as Promise<{
      schema?: Record<string, unknown>;
    }>);
    return {
      type: safeOutput.name as string,
      schema: format?.schema,
    };
  }
  return output;
};

const rehydrateAIResponse = <TOOLS extends SDKTools, OUTPUT extends SDKOutput>(
  serialized: SerializableAIResponse<TOOLS, OUTPUT>,
): GenerateTextResult<TOOLS, OUTPUT> => {
  return {
    ...serialized,
    toolCalls: serialized.toolCalls ?? [],
    toolResults: serialized.toolResults ?? [],
    warnings: serialized.warnings ?? [],
    files: serialized.files?.map(file => ({
      mediaType: file.mediaType,
      base64: file.base64,
      uint8Array: base64ToUint8Array(file.base64),
    })),
  } as GenerateTextResult<TOOLS, OUTPUT>;
};

/**
 * Fetch a short-lived gateway access token. Same-origin POST to the Rails
 * `/ai_gateway/access_token` endpoint.
 *
 * The Rails controller's authorization check reads
 * `params[:aichatContext][:clientType]` unconditionally and crashes with
 * `NoMethodError` if `aichatContext` is absent, so we always include it
 * in the JSON body. The controller skips CSRF verification, so no
 * `X-CSRF-Token` header is required.
 *
 * `clientType` defaults to `flow-lab` because Rails's `User#trust_chat_client?`
 * trusts that value for any signed-in user; `ai-tutor` is no longer in the
 * trusted list, so using it would require teacher / levelbuilder / enabled-
 * section permissions on the user record.
 */
export async function fetchAccessToken(
  clientType: string = 'flow-lab',
  accessTokenPath: string = ACCESS_TOKEN_PATH,
): Promise<string> {
  const res = await fetch(accessTokenPath, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {'Content-Type': 'application/json; charset=UTF-8'},
    body: JSON.stringify({aichatContext: {clientType}}),
  });
  if (!res.ok) {
    throw new Error(`AI Gateway access-token fetch failed (${res.status})`);
  }
  const json = (await res.json()) as {token?: string};
  if (!json?.token) {
    throw new Error('AI Gateway access-token response missing `token`');
  }
  return json.token;
}

/** Coerce the SDK's `model` field to the gateway's expected string id. */
function getModelString(model: unknown): string {
  if (typeof model === 'string') return model;
  const safe = model as Record<string, unknown> | null;
  if (safe && typeof safe === 'object' && typeof safe.modelId === 'string') {
    return safe.modelId;
  }
  throw new Error('Invalid model provided to AI Gateway.');
}

/**
 * Fulfills the AI SDK's `generateText` through the gateway. Accepts the SDK's
 * own options object (model, messages, system, tools, output, …), serializes
 * the output schema, sends the request, and rehydrates the response. Same
 * shape as `apps/src/aiGateway/generateText.ts`.
 */
export async function generateTextThroughGateway<
  TOOLS extends SDKTools = SDKTools,
  OUTPUT extends SDKOutput = SDKOutput,
>(options: SDKOptions): Promise<GenerateTextResult<TOOLS, OUTPUT>> {
  const {model, ...restOptions} = options;
  const serializedOutput = await serializeOutputSchema(options.output);

  const payload = {
    ...restOptions,
    model: getModelString(model),
    output: serializedOutput,
  };

  const token = await fetchAccessToken();

  const response = await fetch(AI_GATEWAY_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({...payload, token}),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `AI Gateway request failed (${response.status}): ${body.slice(0, 200)}`,
    );
  }

  const data = (await response.json()) as SerializableAIResponse<TOOLS, OUTPUT>;
  return rehydrateAIResponse<TOOLS, OUTPUT>(data);
}

// Convenience aliases matching the legacy export names.
export {generateTextThroughGateway as generateText};
