import {queryParams} from '@cdo/apps/code-studio/utils';
import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

const modelQueryParam = queryParams('aitutor2-model')
  ? queryParams('aitutor2-model')
  : queryParams('aitutor-model');

// This type is the union of all the valid AI Model IDs.
export type AiChatModelIdType = ValueOf<typeof AiChatModelIds>;

/** The model named in the query string, if it is a valid id. */
export const aiTutorModelIdFromQuery = Object.values(AiChatModelIds).includes(
  modelQueryParam as AiChatModelIdType
)
  ? (modelQueryParam as AiChatModelIdType)
  : undefined;

/** The tutor's default model: the query string's, else Gemini 2.5 Flash. */
export const aiTutorModelId: AiChatModelIdType =
  aiTutorModelIdFromQuery ?? AiChatModelIds.GEMINI_2_5_FLASH;
