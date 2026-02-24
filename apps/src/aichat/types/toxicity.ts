import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatTeacherFeedback} from '@cdo/generated-scripts/sharedConstants';

import {FIELDS_CHECKED_FOR_TOXICITY} from '../views/modelCustomization/constants';

/** Response structure for the detect toxicity API */
export interface DetectToxicityResponse {
  flaggedFields: FlaggedField[];
}

export type ToxicityCheckedField = (typeof FIELDS_CHECKED_FOR_TOXICITY)[number];

export interface FlaggedField {
  field: ToxicityCheckedField;
  toxicity: {
    text: string;
    blockedBy: 'openai';
    details: {evaluation: string};
  };
}

// Convenience type for the values of AiChatTeacherFeedback
export type FeedbackValue = ValueOf<typeof AiChatTeacherFeedback>;
