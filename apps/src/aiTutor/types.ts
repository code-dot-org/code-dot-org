/** TODO-AITUTOR: Clean up and remove deprecated types along with chatApi and interactionsApi cleanup
 **/

import {ValueOf} from '@cdo/apps/types/utils';
import {
  AiTutorInteractionStatus as AITutorInteractionStatus,
  AiTutorTypes as AITutorActions,
} from '@cdo/generated-scripts/sharedConstants';

export type AITutorAction = ValueOf<typeof AITutorActions>;
export type AITutorInteractionStatusValue = ValueOf<
  typeof AITutorInteractionStatus
>;

export interface AITutorInteraction {
  userId?: number;
  levelId?: number;
  scriptId?: number;
  type: AITutorAction | undefined;
  prompt: string;
  status: AITutorInteractionStatusValue;
  aiResponse?: string;
}

// below are used in new tutor!

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

export interface AiTutorContext {
  sourceCode?: string;
  validationContents?: string;
  validationResults?: string;
  longInstructions?: string;
  documentation?: string;
}
