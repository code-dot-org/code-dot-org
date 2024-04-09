import {LevelProperties} from '@cdo/apps/lab2/types';
import {
  AiTutorInteractionStatus as AITutorInteractionStatus,
  PiiTypes as PII,
} from '@cdo/apps/util/sharedConstants';

// TODO: Update this once https://codedotorg.atlassian.net/browse/CT-471 is resolved
export type AITutorInteractionStatusType = string;

export {PII, AITutorInteractionStatus};

export type ChatCompletionMessage = {
  id: number;
  role: Role;
  chatMessageText: string;
  status: AITutorInteractionStatusType;
  timestamp?: string;
};

export enum Role {
  ASSISTANT = 'assistant',
  USER = 'user',
  SYSTEM = 'system',
  MODEL_UPDATE = 'update',
}

export enum ViewMode {
  EDIT = 'edit-mode',
  PRESENTATION = 'presentation-mode',
}

export interface AichatLevelProperties extends LevelProperties {
  // --- DEPRECATED - used for old AI Chat
  systemPrompt: string;
  botTitle?: string;
  botDescription?: string;
  // ---

  /**
   * Initial AI chat customizations set by the level.
   * For each field, levelbuilders may define the initial default value,
   * and visibility (hidden, readonly, or editable).
   * Visibility is not editable by the student; students can only change
   * the value if it is set to editable.
   */
  aichatSettings?: LevelAichatSettings;
}

/** AI customizations for student chat bots */
export interface AiCustomizations {
  temperature: number;
  systemPrompt: string;
  retrievalContexts: string[];
  modelCardInfo: ModelCardInfo;
}

/** Chat bot Model Card information */
export interface ModelCardInfo {
  botName: string;
  description: string;
  intendedUse: string;
  limitationsAndWarnings: string;
  testingAndEvaluation: string;
  exampleTopics: string[];
}

// Visibility for AI customization fields set by levelbuilders.
export enum Visibility {
  HIDDEN = 'hidden',
  READONLY = 'readonly',
  EDITABLE = 'editable',
}

/**
 * Level-defined AI customizations for student chat bots set by levelbuilders on the level's properties.
 * Levelbuilders can define initial default values for each field, as well as their visibilities.
 */
export interface LevelAichatSettings {
  initialCustomizations: AiCustomizations;
  visibilities: {[key in keyof AiCustomizations]: Visibility};
  /** If the presentation panel is hidden from the student. */
  hidePresentationPanel: boolean;
}
