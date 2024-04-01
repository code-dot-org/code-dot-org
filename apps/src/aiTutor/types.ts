import {
  AiTutorInteractionStatus as AITutorInteractionStatus,
  AiTutorTypes as AITutorTypes,
  PiiTypes as PII,
} from '@cdo/apps/util/sharedConstants';

export type AITutorTypesValue =
  (typeof AITutorTypes)[keyof typeof AITutorTypes];
export type AITutorInteractionStatusValue =
  (typeof AITutorInteractionStatus)[keyof typeof AITutorInteractionStatus];

export {AITutorInteractionStatus, AITutorTypes, PII};

export interface ChatCompletionMessage {
  id: number;
  role: Role;
  chatMessageText: string;
  status: AITutorInteractionStatusValue;
  timestamp?: string;
}

export interface AITutorInteraction {
  userId?: number;
  levelId?: number;
  scriptId?: number;
  type: AITutorTypesValue | undefined;
  isProjectBacked?: boolean;
  prompt: string;
  status: string;
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
  status: string;
  studentName: string;
  type: AITutorTypesValue;
  updatedAt?: string;
  userId: number;
}

export interface Level {
  id: number;
  type: string;
  hasValidation: boolean;
  isAssessment: boolean;
  isProjectBacked: boolean;
}

export interface ChatContext {
  // studentInput is the last user message for general chat
  // or the student's code for compilation and validaiton.
  studentInput: string;
  tutorType: AITutorTypesValue | undefined;
}

export enum Role {
  ASSISTANT = 'assistant',
  USER = 'user',
  SYSTEM = 'system',
}
