import {ValueOf} from '@cdo/apps/types/utils';
import experiments from '@cdo/apps/util/experiments';
import {
  AiChatGeminiModelIds,
  AiChatModelIds,
} from '@cdo/generated-scripts/sharedConstants';

type ModelId = ValueOf<typeof AiChatModelIds>;

const isGeminiModelId = (modelId: string): boolean =>
  (AiChatGeminiModelIds as readonly string[]).includes(modelId);

// Models with no Rails backend support, so they always route through the
// gateway.
const GATEWAY_ONLY_MODEL_IDS: readonly string[] = [
  AiChatModelIds.GEMINI_2_5_FLASH_IMAGE,
  AiChatModelIds.GEMINI_3_1_FLASH_IMAGE,
  AiChatModelIds.GPT_5_6_LUNA,
  AiChatModelIds.GPT_6_LUNA,
];

// Allows features/apps to opt-in to using AI Gateway. Stopgap until
// all Gemini traffic is moved over to the gateway.
let optedIn = false;

export function setAiGatewayOptIn(optIn: boolean) {
  optedIn = optIn;
}

export default function shouldUseAiGateway(modelId: ModelId) {
  if (GATEWAY_ONLY_MODEL_IDS.includes(modelId)) return true;
  return (
    isGeminiModelId(modelId) &&
    (experiments.isEnabledAllowingQueryString(experiments.USE_AI_GATEWAY) ||
      optedIn)
  );
}
