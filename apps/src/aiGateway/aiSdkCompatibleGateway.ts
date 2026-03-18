import {generateText, type GenerateTextResult} from 'ai';

import HttpClient from '../util/HttpClient';

import {
  GatewayGenerateTextResponseV1Schema,
  type GatewayGenerateTextRequestV1,
  type GatewayGenerateTextResponseV1,
} from './gatewaySchemas';
import {AI_GATEWAY_URL, fetchAccessToken, getModelString} from './shared';

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
    // Restore types that don't survive JSON serialisation.
    text: wire.text ?? '',
    files: wire.files?.map(file => ({
      mediaType: file.mediaType,
      base64: file.base64,
      uint8Array: base64ToUint8Array(file.base64),
    })),
    toolCalls: (wire.toolCalls ?? []) as GenerateTextResult<
      TOOLS,
      OUTPUT
    >['toolCalls'],
    toolResults: (wire.toolResults ?? []) as GenerateTextResult<
      TOOLS,
      OUTPUT
    >['toolResults'],
    warnings: wire.warnings ?? [],
    // output is unknown in the wire schema; callers cast it to the concrete
    // type inferred from their OUTPUT generic (e.g. {classification: string}).
    output: wire.output as OUTPUT,
    // Restore the Date that was serialised to an ISO string.
    response: wire.response
      ? {...wire.response, timestamp: new Date(wire.response.timestamp)}
      : (undefined as unknown as GenerateTextResult<TOOLS, OUTPUT>['response']),
  } as GenerateTextResult<TOOLS, OUTPUT>;
};

const generateTextThroughGateway = async <
  TOOLS extends SDKTools = SDKTools,
  OUTPUT extends SDKOutput = SDKOutput
>(
  options: SDKOptions
): Promise<GenerateTextResult<TOOLS, OUTPUT>> => {
  try {
    const {model, ...restOptions} = options;

    const serializedOutput = await serializeOutputSchema(options.output);

    const payload: GatewayGenerateTextRequestV1 = {
      ...restOptions,
      model: getModelString(model),
      output: serializedOutput as GatewayGenerateTextRequestV1['output'],
    };

    const token = await fetchAccessToken();

    const httpResponse = await HttpClient.post(
      AI_GATEWAY_URL,
      JSON.stringify({...payload, token}),
      false,
      {'Content-Type': 'application/json'}
    );

    const wire = GatewayGenerateTextResponseV1Schema.parse(
      await httpResponse.json()
    );

    return rehydrateAIResponse<TOOLS, OUTPUT>(wire);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export {generateTextThroughGateway as generateText};
