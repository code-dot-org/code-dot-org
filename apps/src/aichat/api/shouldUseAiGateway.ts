import {ValueOf} from '@cdo/apps/types/utils';
import experiments from '@cdo/apps/util/experiments';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {isGeminiModel} from './client/helpers/modelHelpers';

type ModelId = ValueOf<typeof AiChatModelIds>;

export default function shouldUseAiGateway(modelId: ModelId) {
  // FLASH_IMAGE has no Rails backend support, so it always routes through the gateway.
  if (modelId === AiChatModelIds.GEMINI_2_5_FLASH_IMAGE) return true;
  return (
    isGeminiModel(modelId) &&
    experiments.isEnabledAllowingQueryString(experiments.USE_AI_GATEWAY)
  );
}
