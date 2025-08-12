import {queryParams} from '@cdo/apps/code-studio/utils';
import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

const modelQueryParam = queryParams('aitutor2-model');

// This type is the union of all the valid AI Model IDs.
export type AiChatModelIdType = ValueOf<typeof AiChatModelIds>;

// Only use modelQueryParam as modelId if it is a valid id, otherwise set to default
// of Gemini 2.0 Flash.
export const aiTutorModelId = Object.values(AiChatModelIds).includes(
  modelQueryParam as AiChatModelIdType
)
  ? (modelQueryParam as AiChatModelIdType)
  : AiChatModelIds.GEMINI_2_0_FLASH;
