import {ValueOf} from '@cdo/apps/types/utils';
import experiments from '@cdo/apps/util/experiments';
import {
  AiChatGeminiModelIds,
  AiChatModelIds,
} from '@cdo/generated-scripts/sharedConstants';

type ModelId = ValueOf<typeof AiChatModelIds>;

const isGeminiModelId = (modelId: string): boolean =>
  (AiChatGeminiModelIds as readonly string[]).includes(modelId);

// The image models have no Rails backend support, so they always route
// through the gateway.
const IMAGE_MODEL_IDS: readonly string[] = [
  AiChatModelIds.GEMINI_2_5_FLASH_IMAGE,
  AiChatModelIds.GEMINI_3_1_FLASH_IMAGE,
];

export default function shouldUseAiGateway(modelId: ModelId) {
  if (IMAGE_MODEL_IDS.includes(modelId)) return true;
  return (
    isGeminiModelId(modelId) &&
    experiments.isEnabledAllowingQueryString(experiments.USE_AI_GATEWAY)
  );
}
