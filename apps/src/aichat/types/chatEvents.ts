import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {ValueOf} from '@cdo/apps/types/utils';
import {AiInteractionStatus} from '@cdo/generated-scripts/sharedConstants';

import {AiCustomizations} from './customizations';
import {FeedbackValue} from './miscellaneous';

export type ChatEventDescriptionKey = 'COPY_CHAT' | 'CLEAR_CHAT' | 'LOAD_LEVEL';

export interface ChatEvent {
  // Populated from the db when fetching chat events from the backend
  id?: number;
  // UTC timestamp in milliseconds
  timestamp: number;
  // This field is optional but when it is defined, it must be set to `true`.
  // This allows the chat event to be visible by default without having to add an extra field.
  hideForParticipants?: true;
  /** Optional key used if this event has a localized text description (ex. copy chat, clear chat, load level) */
  descriptionKey?: ChatEventDescriptionKey;
}

export interface ChatMessage extends ChatEvent {
  chatMessageText: string;
  role: Role;
  status: ValueOf<typeof AiInteractionStatus>;
  requestId?: number;
  // If undefined, the teacher took no action or undid their action.
  teacherFeedback?: FeedbackValue;
}

export interface ModelUpdate extends ChatEvent {
  id: number;
  updatedField: keyof AiCustomizations;
  updatedValue: AiCustomizations[keyof AiCustomizations];
}

export interface Notification extends ChatEvent {
  id: number;
  text: string;
  notificationType: 'permissionsError' | 'error' | 'success';
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
