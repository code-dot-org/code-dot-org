import {LevelProperties} from '@cdo/apps/lab2/types';

// TODO: Update this once https://codedotorg.atlassian.net/browse/CT-471 is resolved
export type AichatInteractionStatusValue = string;

export type ChatCompletionMessage = {
  id: number;
  role: Role;
  chatMessageText: string;
  status: AichatInteractionStatusValue;
  chatMessageSuffix?: ChatMessageSuffix;
  timestamp?: string;
};

export type AichatCompletionMessage = Pick<
  ChatCompletionMessage,
  'role' | 'chatMessageText' | 'status'
>;

type ChatMessageSuffix = {
  text: string;
  boldtypeText?: string;
};

export type AichatContext = {
  currentLevelId: number | null;
  scriptId: number | null;
  channelId: string | undefined;
};

export enum Role {
  ASSISTANT = 'assistant',
  USER = 'user',
  SYSTEM = 'system',
  MODEL_UPDATE = 'update',
  ERROR_NOTIFICATION = 'error_notification',
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

/** Model customizations and model card information for aichat levels.
 *  selectedModelId is a foreign key to ModelDescription.id */
export interface AiCustomizations {
  selectedModelId: string;
  temperature: number;
  systemPrompt: string;
  retrievalContexts: string[];
  modelCardInfo: ModelCardInfo;
}

// Model customizations sent to backend for aichat levels - excludes modelCardInfo.
// The customizations will be included in request to LLM endpoint.
export type AichatModelCustomizations = Omit<AiCustomizations, 'modelCardInfo'>;

export type FieldVisibilities = {[key in keyof AiCustomizations]: Visibility};

/** Chat bot Model Card information */
export interface ModelCardInfo {
  botName: string;
  description: string;
  intendedUse: string;
  limitationsAndWarnings: string;
  testingAndEvaluation: string;
  exampleTopics: string[];
  isPublished: boolean;
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

// The type of save action being performed (customization update, publish, model card save, etc).
export type SaveType = 'updateChatbot' | 'publishModelCard' | 'saveModelCard';
