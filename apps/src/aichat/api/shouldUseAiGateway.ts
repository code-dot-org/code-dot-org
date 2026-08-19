import {ValueOf} from '@cdo/apps/types/utils';
import experiments from '@cdo/apps/util/experiments';
import {
  AiChatGeminiModelIds,
  AiChatModelIds,
} from '@cdo/generated-scripts/sharedConstants';

type ModelId = ValueOf<typeof AiChatModelIds>;

const isGeminiModelId = (modelId: string): boolean =>
  (AiChatGeminiModelIds as readonly string[]).includes(modelId);

export default function shouldUseAiGateway(modelId: ModelId) {
  // FLASH_IMAGE has no Rails backend support, so it always routes through the gateway.
  if (modelId === AiChatModelIds.GEMINI_2_5_FLASH_IMAGE) return true;
  return (
    isGeminiModelId(modelId) &&
    experiments.isEnabledAllowingQueryString(experiments.USE_AI_GATEWAY)
  );
}
