import {AiTutorInteractionSaveStatus, AiTutorTypes} from '@cdo/apps/util/sharedConstants';

export type ChatCompletionMessage = {
  id: number;
  role: Role;
  chatMessageText: string;
  status: Status;
  timestamp?: string;
};

export type AITutorInteraction = {
  userId: number;
  levelId: number;
  scriptId: number;
  type: TutorTypes;
  prompt: string;
  status: string;
  aiResponse: string;
};

export type Level = {
  id: number;
  type: string;
  hasValidation: boolean;
  isProjectBacked: boolean;
};

export enum Role {
  ASSISTANT = 'assistant',
  USER = 'user',
  SYSTEM = 'system',
}
export type Status = typeof AiTutorInteractionSaveStatus[keyof typeof AiTutorInteractionSaveStatus];
export const Status = AiTutorInteractionSaveStatus;
export const PII = [Status.EMAIL, Status.ADDRESS, Status.PHONE];

export type TutorTypes = typeof AiTutorTypes[keyof typeof AiTutorTypes];
export const TutorTypes = AiTutorTypes;
