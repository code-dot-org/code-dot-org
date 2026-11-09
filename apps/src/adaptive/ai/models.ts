// The models the adaptive shell asks, as two tiers rather than one per call,
// so the whole set swaps at once. Gemini's set unless the page's query string
// names another provider, which is how the OpenAI path gets playtested.

import {queryParams} from '@cdo/apps/code-studio/utils';
import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

type ModelId = ValueOf<typeof AiChatModelIds>;

interface AdaptiveModels {
  /** The project build and the AI Tutor, where the answer is the work. */
  STANDARD: ModelId;
  /** Instructions, the validation judge and the safety judge. */
  FAST: ModelId;
}

const ADAPTIVE_MODEL_PROVIDERS = ['gemini', 'openai'] as const;
type AdaptiveModelProvider = (typeof ADAPTIVE_MODEL_PROVIDERS)[number];

const MODELS_BY_PROVIDER: Record<AdaptiveModelProvider, AdaptiveModels> = {
  gemini: {
    STANDARD: AiChatModelIds.GEMINI_3_5_FLASH_LITE,
    FAST: AiChatModelIds.GEMINI_3_1_FLASH_LITE,
  },
  openai: {
    STANDARD: AiChatModelIds.GPT_6_LUNA,
    FAST: AiChatModelIds.GPT_6_LUNA,
  },
};

/** Query string parameter naming the provider, e.g. `?adaptive-model-provider=openai`. */
const ADAPTIVE_MODEL_PROVIDER_PARAM = 'adaptive-model-provider';

const isProvider = (value: unknown): value is AdaptiveModelProvider =>
  (ADAPTIVE_MODEL_PROVIDERS as readonly unknown[]).includes(value);

const providerFromQuery = queryParams(ADAPTIVE_MODEL_PROVIDER_PARAM);

/** The provider in use: the query string's when it names one, else Gemini. */
const ADAPTIVE_MODEL_PROVIDER: AdaptiveModelProvider = isProvider(
  providerFromQuery
)
  ? providerFromQuery
  : 'gemini';

export const ADAPTIVE_MODELS: AdaptiveModels =
  MODELS_BY_PROVIDER[ADAPTIVE_MODEL_PROVIDER];
