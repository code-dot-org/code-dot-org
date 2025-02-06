import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatTeacherFeedback} from '@cdo/generated-scripts/sharedConstants';

import {ChatMessage} from './chatEvents';

// Miscellaneous types used through the AI Chat lab.
// If possible, try to create new types in more specific files.

export interface ChatCompletionApiResponse {
  messages: ChatMessage[];
  flagged_content?: string;
}

export type AichatContext = {
  currentLevelId: number | null;
  scriptId: number | null;
  channelId: string | undefined;
};

export enum ViewMode {
  EDIT = 'edit-mode',
  PRESENTATION = 'presentation-mode',
}

// The type of save action being performed (customization update, publish, model card save, etc).
export type SaveType = 'updateChatbot' | 'publishModelCard' | 'saveModelCard';

// Convenience type for the values of AiChatTeacherFeedback
export type FeedbackValue = ValueOf<typeof AiChatTeacherFeedback>;
