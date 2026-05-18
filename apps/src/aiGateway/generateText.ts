import {generateText, type GenerateTextResult} from 'ai';

import HttpClient from '@cdo/apps/util/HttpClient';

import {
  GatewayGenerateTextResponseV1Schema,
  type GatewayGenerateTextResponseV1,
} from './gatewaySchemas';
import {getErrorLogData} from './logHelper';
import {AI_GATEWAY_URL, fetchAccessToken, getModelString} from './shared';
import {
  fetchTurnstileTokenIfEnabled,
  turnstileHeaders,
} from './turnstile';
import {LOG} from './turnstile/constants';

type SDKOptions = Parameters<typeof generateText>[0];
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

const rehydrateAIResponse = <TOOLS extends SDKTools, OUTPUT extends SDKOutput>(
  wire: GatewayGenerateTextResponseV1
): GenerateTextResult<TOOLS, OUTPUT> => {
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
  } as unknown as GenerateTextResult<TOOLS, OUTPUT>;
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
  options: SDKOptions
): Promise<GenerateTextResult<TOOLS, OUTPUT>> => {
  try {
    const {model, ...restOptions} = options;

    const serializedOutput = await serializeOutputSchema(options.output);

    const payload = {
      ...restOptions,
      model: getModelString(model),
      output: serializedOutput,
    };

    const [token, turnstileToken] = await Promise.all([
      fetchAccessToken(),
      fetchTurnstileTokenIfEnabled(),
    ]);

    const headers = {
      'Content-Type': 'application/json',
      ...turnstileHeaders(turnstileToken),
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
      console.error(
        `${LOG} generateText response schema mismatch:`,
        parseResult.error.errors
      );
      if (process.env.NODE_ENV === 'development') {
        throw parseResult.error;
      }
    }
    const wire = parseResult.success
      ? parseResult.data
      : (rawResponse as GatewayGenerateTextResponseV1);

    return rehydrateAIResponse<TOOLS, OUTPUT>(wire);
  } catch (error) {
    const logData = await getErrorLogData(error);
    console.error('Fetch error in generateTextThroughGateway:', logData);
    throw error;
  }
};

export default generateTextThroughGateway;
