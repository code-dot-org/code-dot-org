import type {generateText as aiGenerateText, GenerateTextResult} from 'ai';

import HttpClient from '@cdo/apps/util/HttpClient';

type SDKOptions = Parameters<typeof aiGenerateText>[0];
type SDKOutput = NonNullable<SDKOptions['output']>;

type GatewayOptions = Omit<SDKOptions, 'model'> & {
  model: string;
};

type SerializableAIResponse<OUTPUT extends SDKOutput = SDKOutput> = Omit<
  GenerateTextResult<Record<string, never>, OUTPUT>,
  'text' | 'files'
> & {
  text?: string;
  files?: {mediaType: string; base64: string}[];
};

const AI_GATEWAY_URL = `https://ai-gateway.code.org`;

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  return Uint8Array.from(binaryString, char => char.charCodeAt(0));
};

// Output.object() internally wraps the JSON Schema in a Promise, so we must
// await it before serializing for JSON transport to the gateway.
const serializeOutputSchema = async (output?: SDKOptions['output']) => {
  if (!output) return output;

  const safeOutput = output as unknown as Record<string, unknown>;
  if ('responseFormat' in safeOutput) {
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

const rehydrateAIResponse = <OUTPUT extends SDKOutput>(
  serialized: SerializableAIResponse<OUTPUT>
): GenerateTextResult<Record<string, never>, OUTPUT> => {
  return {
    ...serialized,
    toolCalls: [],
    toolResults: [],
    warnings: serialized.warnings ?? [],

    get text() {
      if (serialized.text === undefined) {
        throw new Error(
          'No text was generated. The model likely finished due to tool calls.'
        );
      }
      return serialized.text;
    },

    files: serialized.files?.map(file => ({
      mediaType: file.mediaType,
      base64: file.base64,
      uint8Array: base64ToUint8Array(file.base64),
    })),
  } as GenerateTextResult<Record<string, never>, OUTPUT>;
};

export const generateText = async <OUTPUT extends SDKOutput = SDKOutput>(
  options: GatewayOptions
): Promise<GenerateTextResult<Record<string, never>, OUTPUT>> => {
  try {
    const {model, ...restOptions} = options;
    const serializedOutput = await serializeOutputSchema(options.output);

    const {
      value: {token},
    } = await HttpClient.fetchJson<{token: string}>('/ai_gateway/access_token');

    const payload = {
      ...restOptions,
      model,
      output: serializedOutput,
      token,
    };

    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await (response.json() as Promise<
      SerializableAIResponse<OUTPUT>
    >);

    return rehydrateAIResponse<OUTPUT>(data);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};
