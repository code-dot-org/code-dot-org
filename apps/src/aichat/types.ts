import {LevelProperties} from '@cdo/apps/lab2/types';

// TODO: Ideally this type would only contain keys present in
// translated string JSON files (ex. apps/i18n/aichat/en_us.json).
// However, this requires depending on files outside of apps/src,
// so this approach is still being investigated. For now, this type
// is an object whose keys are all functions which return strings,
// matching what we expect for a locale object.
export type AichatLocale = {
  [key: string]: () => string;
};

export type ChatCompletionMessage = {
  id: number;
  role: Role;
  chatMessageText: string;
  status: Status;
  timestamp?: string;
};

export enum Role {
  ASSISTANT = 'assistant',
  USER = 'user',
  SYSTEM = 'system',
}

export enum Status {
  OK = 'ok',
  PERSONAL = 'personal',
  INAPPROPRIATE = 'inappropriate',
  UNKNOWN = 'unknown',
}

export interface AichatLevelProperties extends LevelProperties {
  systemPrompt: string;
  botTitle?: string;
  botDescription?: string;
}
