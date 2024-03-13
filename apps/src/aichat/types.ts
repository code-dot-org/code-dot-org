/* eslint-disable import/order */
import {LevelProperties} from '@cdo/apps/lab2/types';
import {AiTutorInteractionSaveStatus} from '@cdo/apps/util/sharedConstants';

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

export type Status =
  (typeof AiTutorInteractionSaveStatus)[keyof typeof AiTutorInteractionSaveStatus];
export const Status = AiTutorInteractionSaveStatus;
export const PII = [Status.EMAIL, Status.ADDRESS, Status.PHONE];

export interface AichatLevelProperties extends LevelProperties {
  // --- DEPRECATED - used for old AI Chat
  systemPrompt: string;
  botTitle?: string;
  botDescription?: string;
  // ---

  /**
   * Initial AI customizations set by the level.
   * For each field, levelbuilders may define the initial default value,
   * and visibility (hidden, readonly, or editable).
   * Visibility is not editable by the student; students can only change
   * the value if it is set to editable.
   */
  initialAiCustomizations?: LevelAiCustomizations;
}

/** AI customizations for student chat bots */
export interface AiCustomizations {
  botName: string;
  temperature: number;
  systemPrompt: string;
  retrievalContexts: string[];
  modelCardInfo?: ModelCardInfo;
}

/** Chat bot Model Card information */
export interface ModelCardInfo {
  description: string;
  intendedUse: string;
  limitationsAndWarnings: string;
  testingAndEvaluation: string;
  exampleTopics: string[];
}

// Visibility for AI customization fields set by levelbuilders.
export type Visibility = 'hidden' | 'readonly' | 'editable';

/**
 * Level-defined AI customizations for student chat bots set by levelbuilders on the level's properties.
 * Each field is the same as AiCustomizations, but with an additional visibility property.
 */
export type LevelAiCustomizations = {
  [key in keyof AiCustomizations]: {
    value: AiCustomizations[key];
    visibility: Visibility;
  };
} & {
  /** If the presentation panel is hidden from the student. */
  hidePresentationPanel?: boolean;
};
