import {LevelProperties} from '@cdo/apps/lab2/types';

import {NotificationType, Role} from '../aiComponentLibrary/chatItems/types';

// TODO: Update this once https://codedotorg.atlassian.net/browse/CT-471 is resolved
export type AichatInteractionStatusValue = string;

export interface ChatItem {
  // UTC timestamp in milliseconds
  timestamp: number;
}

export interface ChatMessage extends ChatItem {
  chatMessageText: string;
  role: Role;
  status: AichatInteractionStatusValue;
}

export interface ModelUpdate extends ChatItem {
  id: number;
  updatedField: keyof AiCustomizations;
  updatedValue: AiCustomizations[keyof AiCustomizations];
}

export interface Notification extends ChatItem {
  id: number;
  text: string;
  notificationType: NotificationType;
}

// Type Predicates: checks if a ChatItem is a given type, and more helpfully,
// automatically narrows to the specific type.
export function isChatMessage(item: ChatItem): item is ChatMessage {
  return (item as ChatMessage).chatMessageText !== undefined;
}

export function isModelUpdate(item: ChatItem): item is ModelUpdate {
  return (item as ModelUpdate).updatedField !== undefined;
}

export function isNotification(item: ChatItem): item is Notification {
  return (item as Notification).notificationType !== undefined;
}

export interface ChatApiResponse {
  messages: ChatMessage[];
  session_id: number;
  flagged_content?: string;
}

export type AichatContext = {
  currentLevelId: number | null;
  scriptId: number | null;
  channelId: string | undefined;
};

export enum ViewMode {
  EDIT = 'edit-mode',
  PRESENTATION = 'presentation-mode',
}

export interface AichatLevelProperties extends LevelProperties {
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
