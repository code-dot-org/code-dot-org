import {AiTutorModelParameters} from '@cdo/apps/aichat/types';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

const modelQueryParam = queryParams('aitutor2-model')
  ? queryParams('aitutor2-model')
  : queryParams('aitutor-model');

// This type is the union of all the valid AI Model IDs.
export type AiChatModelIdType = ValueOf<typeof AiChatModelIds>;

/** The model named in the query string, if it is a valid id. */
const aiTutorModelIdFromQuery = Object.values(AiChatModelIds).includes(
  modelQueryParam as AiChatModelIdType
)
  ? (modelQueryParam as AiChatModelIdType)
  : undefined;

/** The tutor's default model: the query string's, else Gemini 2.5 Flash. */
export const defaultAiTutorModelId: AiChatModelIdType =
  aiTutorModelIdFromQuery ?? AiChatModelIds.GEMINI_2_5_FLASH;

/** What the tutor asks on a level: the query string's model, else the level's, else the default. */
export function aiTutorModelParametersFor(
  level?: AiTutorModelParameters
): AiTutorModelParameters {
  if (aiTutorModelIdFromQuery)
    return {selectedModelId: aiTutorModelIdFromQuery};
  return level ?? {selectedModelId: defaultAiTutorModelId};
}
