import {LevelProperties} from '@cdo/apps/lab2/types';

export type ChatCompletionMessage = {
  id: number;
  role: Role;
  chatMessageText: string;
  status: AichatInteractionStatus;
  timestamp?: string;
};

export type ChatContext = {
  userId: number;
  currentLevelId: string | null;
  scriptId: number | null;
  channelId: string | undefined;
};

export enum AichatInteractionStatus {
  ERROR = 'error',
  PII_VIOLATION = 'pii_violation',
  PROFANITY_VIOLATION = 'profanity_violation',
  OK = 'ok',
  UNKNOWN = 'unknown',
}

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

/** AI customizations for student chat bots
 *  selectedModelId is a foreign key to ModelDescription.id */
export interface AiCustomizations {
  selectedModelId: string;
  temperature: number;
  systemPrompt: string;
  retrievalContexts: string[];
  modelCardInfo: ModelCardInfo;
}

export type AichatParameters = Omit<AiCustomizations, 'modelCardInfo'>;

/** Chat bot Model Card information */
export interface ModelCardInfo {
  botName: string;
  description: string;
  intendedUse: string;
  limitationsAndWarnings: string;
  testingAndEvaluation: string;
  exampleTopics: string[];
}

/** Metadata about a given model, common across all aichat levels */
export interface ModelDescription {
  id: string;
  name: string;
  overview: string;
  trainingData: string;
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
  /** list of ModelDescription.ids to limit the models available to choose from in the level */
  availableModelIds: string[];
}
