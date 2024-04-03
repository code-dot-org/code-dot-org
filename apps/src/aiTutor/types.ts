import {
  AiTutorInteractionSaveStatus,
  AiTutorTypes,
} from '@cdo/apps/util/sharedConstants';

export type ChatCompletionMessage = {
  id: number;
  role: Role;
  chatMessageText: string;
  status: Status;
  timestamp?: string;
};

export type AITutorInteraction = {
  userId?: number;
  levelId?: number;
  scriptId?: number;
  type: TutorType | undefined;
  isProjectBacked?: boolean;
  prompt: string;
  status: string;
  aiResponse?: string;
};

export type StudentChatRow = {
  id: number;
  studentName: string;
  type: TutorType;
  prompt: string;
  status: string;
  aiResponse?: string;
  createdAt: string;
};

export type StudentServerData = {
  id: number;
  name: string;
  ai_tutor_access_denied: boolean;
};

export type StudentAccessData = {
  id: number;
  name: string;
  aiTutorAccessDenied: boolean;
};

export type Level = {
  id: number;
  type: string;
  hasValidation: boolean;
  isProjectBacked: boolean;
  aiTutorAvailable: boolean;
  isAssessment: boolean;
};

export interface ChatContext {
  // studentInput is the last user message for general chat
  // or the student's code for compilation and validaiton.
  studentInput: string;
  tutorType: TutorType | undefined;
}

export enum Role {
  ASSISTANT = 'assistant',
  USER = 'user',
  SYSTEM = 'system',
}
export type Status =
  (typeof AiTutorInteractionSaveStatus)[keyof typeof AiTutorInteractionSaveStatus];
export const Status = AiTutorInteractionSaveStatus;
export const PII = [Status.EMAIL, Status.ADDRESS, Status.PHONE];

export type TutorType = (typeof AiTutorTypes)[keyof typeof AiTutorTypes];
export const TutorType = AiTutorTypes;
