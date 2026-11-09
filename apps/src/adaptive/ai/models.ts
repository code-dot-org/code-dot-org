// The models the adaptive shell asks, as two tiers rather than one per call,
// so the whole set swaps at once. Google's set unless the page's query string
// names another provider, which is how the OpenAI path gets playtested.

import {queryParams} from '@cdo/apps/code-studio/utils';
import {ValueOf} from '@cdo/apps/types/utils';
import {
  AiChatModelIds,
  AiChatProviders,
} from '@cdo/generated-scripts/sharedConstants';

type ModelId = ValueOf<typeof AiChatModelIds>;
type Provider = ValueOf<typeof AiChatProviders>;

interface AdaptiveModels {
  /** The project build and the AI Tutor, where the answer is the work. */
  STANDARD: ModelId;
  /** Instructions, the validation judge and the safety judge. */
  FAST: ModelId;
}

const MODELS_BY_PROVIDER: Record<Provider, AdaptiveModels> = {
  [AiChatProviders.GOOGLE]: {
    STANDARD: AiChatModelIds.GEMINI_3_5_FLASH_LITE,
    FAST: AiChatModelIds.GEMINI_3_1_FLASH_LITE,
  },
  [AiChatProviders.OPENAI]: {
    STANDARD: AiChatModelIds.GPT_6_LUNA,
    FAST: AiChatModelIds.GPT_6_LUNA,
  },
};

/** Query string parameter naming the provider, e.g. `?adaptive-model-provider=openai`. */
const PROVIDER_PARAM = 'adaptive-model-provider';

const isProvider = (value: unknown): value is Provider =>
  (Object.values(AiChatProviders) as unknown[]).includes(value);

const providerFromQuery = queryParams(PROVIDER_PARAM);

/** The provider in use: the query string's when it names one, else Google. */
const provider: Provider = isProvider(providerFromQuery)
  ? providerFromQuery
  : AiChatProviders.GOOGLE;

export const ADAPTIVE_MODELS: AdaptiveModels = MODELS_BY_PROVIDER[provider];
