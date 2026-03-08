import {generateText, type GenerateTextResult} from 'ai';

import HttpClient from '@cdo/apps/util/HttpClient';

type SDKOptions = Parameters<typeof generateText>[0];
type SDKTools = NonNullable<SDKOptions['tools']>;
type SDKOutput = NonNullable<SDKOptions['output']>;

type GenerateGatewayOptions = SDKOptions & {
  token?: string;
};

type SerializableAIResponse<
  TOOLS extends SDKTools = SDKTools,
  OUTPUT extends SDKOutput = SDKOutput
> = Omit<GenerateTextResult<TOOLS, OUTPUT>, 'text' | 'files'> & {
  text?: string;
  files?: {mediaType: string; base64: string}[];
};

const AI_GATEWAY_URL = `https://ai-gateway.code.org`;

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
  options: GenerateGatewayOptions
): Promise<GenerateTextResult<TOOLS, OUTPUT>> => {
  try {
    const {model, ...restOptions} = options;

    let modelString: string;

    if (typeof model === 'string') {
      modelString = model;
    } else {
      const safeModel = model as unknown as Record<string, unknown>;
      if (
        safeModel !== null &&
        typeof safeModel === 'object' &&
        typeof safeModel.modelId === 'string'
      ) {
        modelString = safeModel.modelId;
      } else {
        throw new Error('Invalid model provided to Gateway.');
      }
    }

    const serializedOutput = await serializeOutputSchema(options.output);

    const payload = {
      ...restOptions,
      model: modelString,
      output: serializedOutput,
      token: '', // Placeholder to be filled after token fetch
    };

    const tokenResponse = await HttpClient.get(
      '/ai_gateway/access_token',
      true,
      {'Content-Type': 'application/json; charset=UTF-8'}
    );

    const {token} = await (tokenResponse.json() as Promise<{token: string}>);
    payload.token = token;

    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

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
