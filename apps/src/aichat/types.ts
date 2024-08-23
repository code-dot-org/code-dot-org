import {LevelProperties} from '@cdo/apps/lab2/types';
import type {
  AiInteractionStatus,
  AiChatModelIds,
} from '@cdo/generated-scripts/sharedConstants';

import {Role} from '../aiComponentLibrary/chatMessage/types';
import type {ValueOf} from '../types/utils';

export const ChatEventDescriptions = {
  CLEAR_CHAT: 'The user cleared the chat workspace.',
  LOAD_LEVEL: 'The user loaded the aichat level.',
} as const;

export interface ChatEvent {
  // UTC timestamp in milliseconds
  timestamp: number;
  // This field is optional but when it is defined, it must be set to `true`.
  // This allows the chat event to be visible by default without having to add an extra field.
  hideForParticipants?: true;
  descriptionKey?: keyof typeof ChatEventDescriptions;
}

export interface ChatMessage extends ChatEvent {
  chatMessageText: string;
  role: Role;
  status: ValueOf<typeof AiInteractionStatus>;
}

export interface ModelUpdate extends ChatEvent {
  id: number;
  updatedField: keyof AiCustomizations;
  updatedValue: AiCustomizations[keyof AiCustomizations];
}

export interface Notification extends ChatEvent {
  id: number;
  text: string;
  notificationType: 'error' | 'success';
  includeInChatHistory?: boolean;
}

// Type Predicates: checks if a ChatEvent is a given type, and more helpfully,
// automatically narrows to the specific type.
export function isChatMessage(event: ChatEvent): event is ChatMessage {
  return (event as ChatMessage).chatMessageText !== undefined;
}

export function isModelUpdate(event: ChatEvent): event is ModelUpdate {
  return (event as ModelUpdate).updatedField !== undefined;
}

export function isNotification(event: ChatEvent): event is Notification {
  return (event as Notification).notificationType !== undefined;
}

export interface ChatCompletionApiResponse {
  messages: ChatMessage[];
  flagged_content?: string;
}

export interface LogChatEventApiResponse {
  chat_event_id: number;
  chat_event: ChatMessage;
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
  selectedModelId: ValueOf<typeof AiChatModelIds>;
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
  id: ValueOf<typeof AiChatModelIds>;
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
  // This system prompt is hidden from students and adds additional safety features or hidden guidelines to a level.
  levelSystemPrompt: string;
  /** If the presentation panel is hidden from the student. */
  hidePresentationPanel: boolean;
  /** list of ModelDescription.ids to limit the models available to choose from in the level */
  availableModelIds: ValueOf<typeof AiChatModelIds>[];
}

// The type of save action being performed (customization update, publish, model card save, etc).
export type SaveType = 'updateChatbot' | 'publishModelCard' | 'saveModelCard';
