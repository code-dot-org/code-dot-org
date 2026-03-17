import {generateText, type GenerateTextResult} from 'ai';

import HttpClient from '../util/HttpClient';

import {AI_GATEWAY_URL, fetchAccessToken, getModelString} from './shared';

type SDKOptions = Parameters<typeof generateText>[0];
type SDKTools = NonNullable<SDKOptions['tools']>;
type SDKOutput = NonNullable<SDKOptions['output']>;

type SerializableAIResponse<
  TOOLS extends SDKTools = SDKTools,
  OUTPUT extends SDKOutput = SDKOutput
> = Omit<GenerateTextResult<TOOLS, OUTPUT>, 'text' | 'files'> & {
  text?: string;
  files?: {mediaType: string; base64: string}[];
};

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
  serialized: SerializableAIResponse<TOOLS, OUTPUT>
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

    const token = await fetchAccessToken();

    const response = await HttpClient.post(
      AI_GATEWAY_URL,
      JSON.stringify({...payload, token}),
      false,
      {'Content-Type': 'application/json'}
    );

    const data = await (response.json() as Promise<
      SerializableAIResponse<TOOLS, OUTPUT>
    >);

    return rehydrateAIResponse<TOOLS, OUTPUT>(data);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export {generateTextThroughGateway as generateText};
