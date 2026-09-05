import * as Observability from '@code-dot-org/core/plugins/observability';

import HttpClient from '@cdo/apps/util/HttpClient';

import AichatContextManager from '../aichat/aichatContextManager';

import {
  CURRENT_SCHEMA_VERSION,
  GatewayGenerateImageResponseV1Schema,
  type GatewayGenerateImageRequestV1,
  type GatewayGenerateImageResponseV1,
} from './contract/gatewaySchemas';
import {reportGatewayError} from './logHelper';
import {
  base64ToUint8Array,
  fetchAccessToken,
  getAiGatewayUrl,
  getModelString,
} from './shared';
import {
  fetchTurnstileToken,
  turnstileErrorTags,
  turnstileHeaders,
} from './turnstile';

/** An image on the wire, plus the decoded bytes callers actually use. */
export interface GatewayGeneratedImage {
  base64: string;
  uint8Array: Uint8Array;
  mediaType: string;
}

/**
 * Shaped like the AI SDK's GenerateImageResult, but its own type rather than
 * a cast: GeneratedFile is a class we cannot construct from wire data, and
 * claiming to return one would be a lie the compiler could not catch.
 */
export interface GatewayGenerateImageResult {
  /** The first generated image; the common case asks for exactly one. */
  image: GatewayGeneratedImage;
  images: GatewayGeneratedImage[];
  warnings: unknown[];
  usage?: GatewayGenerateImageResponseV1['usage'];
  responses?: GatewayGenerateImageResponseV1['responses'];
  providerMetadata?: GatewayGenerateImageResponseV1['providerMetadata'];
}

/** Everything the gateway accepts, minus the token it adds for you. */
export type GenerateImageOptions = Omit<
  GatewayGenerateImageRequestV1,
  'model' | 'token'
> & {
  /** An AI SDK image model or a bare model id string. */
  model: unknown;
};

/**
 * Fulfills the AI SDK generateImage API through the AI Gateway.
 *
 * Separate from generateText because an image model is a different provider
 * interface (ImageModelV3), reached over a different endpoint: no messages,
 * no temperature, no tools, and images come back as the whole result rather
 * than as file parts attached to text.
 */
const generateImageThroughGateway = async (
  options: GenerateImageOptions
): Promise<GatewayGenerateImageResult> => {
  const {model, ...restOptions} = options;
  const modelString = getModelString(model);
  const clientType = AichatContextManager.getContext().clientType;

  let schemaErrorReported = false;
  const execute = async (): Promise<GatewayGenerateImageResult> => {
    try {
      // Serialized, not parallel: the access token response carries the
      // Turnstile mode that decides whether a challenge is needed at all.
      const {token, turnstileEnforcementMode} = await fetchAccessToken();
      const turnstileToken = await fetchTurnstileToken(
        turnstileEnforcementMode
      );

      const response = await HttpClient.post(
        `${getAiGatewayUrl()}/generateImage`,
        JSON.stringify({...restOptions, model: modelString, token}),
        false,
        {
          'Content-Type': 'application/json',
          'X-AI-Gateway-Schema-Version': CURRENT_SCHEMA_VERSION,
          ...turnstileHeaders(turnstileToken),
        }
      );

      const rawResponse = await response.json();
      const parseResult =
        GatewayGenerateImageResponseV1Schema.safeParse(rawResponse);
      if (!parseResult.success) {
        await reportGatewayError(
          parseResult.error,
          'generateImageThroughGateway',
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
        : (rawResponse as GatewayGenerateImageResponseV1);

      const images = (wire.images ?? []).map(image => ({
        base64: image.base64,
        mediaType: image.mediaType,
        uint8Array: base64ToUint8Array(image.base64),
      }));
      if (!images.length) {
        throw new Error('No image was generated');
      }

      return {
        image: images[0],
        images,
        warnings: wire.warnings ?? [],
        usage: wire.usage,
        responses: wire.responses,
        providerMetadata: wire.providerMetadata,
      };
    } catch (error) {
      if (!schemaErrorReported) {
        await reportGatewayError(
          error,
          'generateImageThroughGateway',
          modelString,
          turnstileErrorTags(error)
        );
      }
      throw error;
    }
  };

  return Observability.startSpan(
    {
      name: 'ai-gateway.generateImage',
      op: 'ai.generateImage',
      attributes: {
        'ai.model': modelString,
        'ai.prompt_length': options.prompt.length,
        'ai.client_type': clientType,
        feature: 'ai-gateway',
      },
    },
    execute
  );
};

export default generateImageThroughGateway;
