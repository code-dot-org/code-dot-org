/** TODO-AITUTOR: Clean up and remove deprecated types along with chatApi and interactionsApi cleanup
 **/

import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {ValueOf} from '@cdo/apps/types/utils';
import {
  AiTutorInteractionStatus as AITutorInteractionStatus,
  AiTutorTypes as AITutorActions,
} from '@cdo/generated-scripts/sharedConstants';

export type AITutorAction = ValueOf<typeof AITutorActions>;
export type AITutorInteractionStatusValue = ValueOf<
  typeof AITutorInteractionStatus
>;
export {AITutorInteractionStatus, AITutorActions};

export interface ChatCompletionMessage {
  id?: number;
  role: Role;
  chatMessageText: string;
  status: AITutorInteractionStatusValue;
  timestamp?: string;
}

export interface AITutorInteraction {
  userId?: number;
  levelId?: number;
  scriptId?: number;
  type: AITutorAction | undefined;
  prompt: string;
  status: AITutorInteractionStatusValue;
  aiResponse?: string;
}

export interface StudentServerData {
  id: number;
  name: string;
  ai_tutor_access_denied: boolean;
}

export interface StudentAccessData {
  id: number;
  name: string;
  aiTutorAccessDenied: boolean;
}
