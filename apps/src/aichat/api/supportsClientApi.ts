import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

type ModelId = ValueOf<typeof AiChatModelIds>;
const supportedModels: ModelId[] = [AiChatModelIds.GEMINI_2_5_FLASH_IMAGE];

export default function supportsClientApi(modelId: ModelId) {
  return supportedModels.includes(modelId);
}
