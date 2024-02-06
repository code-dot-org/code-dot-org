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

export enum Status {
  ERROR = 'error',
  PROFANITY = 'profanity',
  PERSONAL = 'personal',
  INAPPROPRIATE = 'inappropriate',
  OK = 'ok',
  UNKNOWN = 'unknown',
  EMAIL = 'email',
  ADDRESS = 'address',
  PHONE = 'phone',
}

export const PII = [Status.EMAIL, Status.ADDRESS, Status.PHONE];

export enum TutorTypes {
  COMPILATION = 'compilation',
  VALIDATION = 'validation',
  GENERAL_CHAT = 'general_chat',
}
