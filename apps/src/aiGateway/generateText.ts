import * as Observability from '@code-dot-org/core/plugins/observability';
import {generateText, type GenerateTextResult} from 'ai';

import HttpClient from '@cdo/apps/util/HttpClient';

import AichatContextManager from '../aichat/aichatContextManager';

import {
  CURRENT_SCHEMA_VERSION,
  GatewayGenerateTextResponseV1Schema,
  type GatewayGenerateTextResponseV1,
} from './contract/gatewaySchemas';
import {reportGatewayError} from './logHelper';
import {AI_GATEWAY_URL, fetchAccessToken, getModelString} from './shared';
import {fetchTurnstileTokenIfEnabled, turnstileHeaders} from './turnstile';

export type GatewayPhase = 'input_filter' | 'generation' | 'output_filter';

type SDKOptions = Parameters<typeof generateText>[0];
type ExtraOptions = Record<string, unknown>;
type SDKTools = NonNullable<SDKOptions['tools']>;
type SDKOutput = NonNullable<SDKOptions['output']>;

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  return Uint8Array.from(binaryString, char => char.charCodeAt(0));
};

// Make the serializer ASYNC to unwrap the SDK's hidden Promise.
const serializeOutputSchema = async (output?: SDKOptions['output']) => {
  if (!output) return output;

  // Use unknown narrowing to safely access internal SDK properties.
  const safeOutput = output as unknown as Record<string, unknown>;

  if (
    typeof safeOutput === 'object' &&
    safeOutput !== null &&
    'responseFormat' in safeOutput
  ) {
    // Await the internal SDK Promise to get the pre-compiled JSON schema!
    const format = await (safeOutput.responseFormat as Promise<{
      schema?: Record<string, unknown>;
    }>);

    return {
      type: safeOutput.name as string, // e.g., 'object', 'array', 'json'.
      schema: format?.schema, // The fully compiled JSON Schema.
    };
  }

  return output;
};

/**
 * The SDK result plus the two gateway-only fields that ride alongside it.
 *
 * `attestation` is the worker's detached signature over the response; callers
 * that persist the response must relay it to dashboard so the value can be
 * verified rather than taken on trust. `outputJson` is the worker's own
 * serialization of `output`, and must be used verbatim rather than
 * re-stringified -- it is the exact byte sequence the attestation covers.
 */
export type GatewayGenerateTextResult<
  TOOLS extends SDKTools,
  OUTPUT extends SDKOutput
> = GenerateTextResult<TOOLS, OUTPUT> & {
  attestation?: string;
  outputJson?: string;
};

const rehydrateAIResponse = <TOOLS extends SDKTools, OUTPUT extends SDKOutput>(
  wire: GatewayGenerateTextResponseV1
): GatewayGenerateTextResult<TOOLS, OUTPUT> => {
  return {
    ...wire,
    text: wire.text ?? '',
    files: wire.files?.map(file => ({
      mediaType: file.mediaType,
      base64: file.base64,
      uint8Array: base64ToUint8Array(file.base64),
    })),
    warnings: wire.warnings ?? [],
    output: wire.output as OUTPUT,
    response: wire.response
      ? {...wire.response, timestamp: new Date(wire.response.timestamp)}
      : (undefined as unknown as GenerateTextResult<TOOLS, OUTPUT>['response']),
  } as unknown as GatewayGenerateTextResult<TOOLS, OUTPUT>;
};

/**
 * Fulfills the AI SDK generateText API through the AI Gateway.
 * This involves serializing the SDK's output schema, calling the gateway,
 * and rehydrating the response back into the SDK's output format.
 */
const generateTextThroughGateway = async <
  TOOLS extends SDKTools = SDKTools,
  OUTPUT extends SDKOutput = SDKOutput
>(
  options: SDKOptions,
  extraOptions?: ExtraOptions
): Promise<GatewayGenerateTextResult<TOOLS, OUTPUT>> => {
  const {model, ...restOptions} = options;
  const phase = extraOptions?.phase as GatewayPhase | undefined;
  const modelString = getModelString(model);
  const promptLength =
    typeof options.prompt === 'string' ? options.prompt.length : 0;
  const clientType = AichatContextManager.getContext().clientType;

  let schemaErrorReported = false;
  const execute = async (): Promise<
    GatewayGenerateTextResult<TOOLS, OUTPUT>
  > => {
    try {
      const serializedOutput = await serializeOutputSchema(options.output);

      const payload = {
        ...restOptions,
        model: modelString,
        output: serializedOutput,
      };

      const [token, turnstileToken] = await Promise.all([
        fetchAccessToken(),
        fetchTurnstileTokenIfEnabled(),
      ]);

      const headers = {
        'Content-Type': 'application/json',
        'X-AI-Gateway-Schema-Version': CURRENT_SCHEMA_VERSION,
        ...turnstileHeaders(turnstileToken),
        ...(phase && {'x-ai-gateway-phase': phase}),
      };

      const response = await HttpClient.post(
        AI_GATEWAY_URL,
        JSON.stringify({...payload, token}),
        false,
        headers
      );

      const rawResponse = await response.json();
      const parseResult =
        GatewayGenerateTextResponseV1Schema.safeParse(rawResponse);
      if (!parseResult.success) {
        await reportGatewayError(
          parseResult.error,
          'generateTextThroughGateway',
          modelString,
          {'error.category': 'schema-mismatch'}
        );
        schemaErrorReported = true;

        if (process.env.NODE_ENV === 'development') {
          throw parseResult.error;
        }
      }
      const wire = parseResult.success
        ? parseResult.data
        : (rawResponse as GatewayGenerateTextResponseV1);

      return rehydrateAIResponse<TOOLS, OUTPUT>(wire);
    } catch (error) {
      if (!schemaErrorReported) {
        await reportGatewayError(
          error,
          'generateTextThroughGateway',
          modelString
        );
      }
      throw error;
    }
  };

  // Start a Sentry span around the entire gateway call for better observability.
  return Observability.startSpan(
    {
      name: 'ai-gateway.generateText',
      op: 'ai.generateText',
      attributes: {
        'ai.model': modelString,
        'ai.prompt_length': promptLength,
        'ai.client_type': clientType,
        feature: 'ai-gateway',
      },
    },
    execute
  );
};

export default generateTextThroughGateway;
