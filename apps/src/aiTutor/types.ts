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

export interface StudentChatRow {
  aiModelVersion: string;
  aiResponse?: string;
  createdAt: string;
  id: number;
  levelId?: number;
  projectId?: string;
  prompt: string;
  scriptId?: number;
  status: AITutorInteractionStatusValue;
  studentName: string;
  type: AITutorAction;
  updatedAt?: string;
  userId: number;
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

export interface Level {
  id: number;
  type: string;
  hasValidation: boolean;
  aiTutorAvailable: boolean;
  isAssessment: boolean;
  progressionType: string;
}

export interface ChatContext {
  // studentInput is the last user message for general chat
  // or the student's code for compilation and validation.
  studentInput: string;
  studentCode?: string;
  actionType?: AITutorAction | undefined;
  systemPrompt?: string;
}
