import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {ValueOf} from '@cdo/apps/types/utils';
import {AiInteractionStatus} from '@cdo/generated-scripts/sharedConstants';

import {ChatAsset} from './assets';
import {ModelParameters} from './customizations';
import {FeedbackValue} from './toxicity';

export type ChatEventDescriptionKey = 'CLEAR_CHAT' | 'LOAD_LEVEL';

/** Base type for all chat events that are displayed in the chat workspace or student chat history view */
interface BaseChatEvent {
  /** UTC timestamp in milliseconds */
  timestamp: number;
}

/** Base type for all chat messages */
interface BaseChatMessage extends BaseChatEvent {
  chatMessageText: string;
  hiddenContext?: string;
  /** Asset file names to optionally send with text content */
  assets?: ChatAsset[];
  role: Role;
  status: ValueOf<typeof AiInteractionStatus>;
}

/** Chat message that is being sent to the server for chat completion. Status and request ID are yet undetermined. */
export interface PendingChatMessage extends BaseChatMessage {
  status: 'unknown';
}

/** Chat message that could not be completed due to a server error. Does not have a request ID. */
export interface ErrorChatMessage extends BaseChatMessage {
  status: 'error';
}

/** Chat message that was processed and returned by the server. Has a request ID, and optionally, teacher feedback. */
export interface CompletedChatMessage extends BaseChatMessage {
  /** Required. Server request ID corresponding to this completed chat message. */
  requestId: number;
  /** Profanity classification feedback given by the teacher. If undefined, the teacher took no action or undid their action. */
  teacherFeedback?: FeedbackValue;
  /**
   * Can be any status besides 'unknown', which is reserved only for pending messages.
   * Note that 'error' here means that the chat message call was returned by the server, but the server returned an error
   * (i.e. downstream AI service error).
   */
  status: Exclude<ValueOf<typeof AiInteractionStatus>, 'unknown'>;
}

/** All chat messages must be one of these types */
export type ChatMessage =
  | PendingChatMessage
  | ErrorChatMessage
  | CompletedChatMessage;

/** Event representing a user action (i.e. copied chat, cleared chat, loaded level). Only displayed in teacher-facing chat history. */
export interface UserActionEvent extends BaseChatEvent {
  descriptionKey: ChatEventDescriptionKey;
}

/** Indicates that there was a model update. */
export interface ModelUpdate extends BaseChatEvent {
  /** ID used for removing from this event from the student's chat workspace. */
  removeId: number;
  updatedField: keyof ModelParameters;
  updatedValue: ModelParameters[keyof ModelParameters];
}

/** Any other general type of notification in the chat workspace. */
export interface Notification extends BaseChatEvent {
  /** ID used for removing from this event from the student's chat workspace. */
  removeId: number;
  text: string;
  notificationType: 'permissionsError' | 'error' | 'success';
  includeInChatHistory?: boolean;
}

/** All chat events displayed in the chat workspace must be one of these types. */
export type ChatEvent =
  | ChatMessage
  | ModelUpdate
  | Notification
  | UserActionEvent;

/**
 * Represents chat events retrieved from the server, displayed in teacher-facing student chat history.
 * Must include an ID, corresponding to server model ID.
 */
export type ServerChatEvent = ChatEvent & {
  id: number;
};

// Type Predicates: checks if a ChatEvent is a given type, and more helpfully,
// automatically narrows to the specific type.
export function isChatMessage(event: ChatEvent): event is ChatMessage {
  return (event as ChatMessage).chatMessageText !== undefined;
}

export function isCompletedChatMessage(
  event: ChatEvent
): event is CompletedChatMessage {
  return (event as CompletedChatMessage).requestId !== undefined;
}

export function isModelUpdate(event: ChatEvent): event is ModelUpdate {
  return (event as ModelUpdate).updatedField !== undefined;
}

export function isNotification(event: ChatEvent): event is Notification {
  return (event as Notification).notificationType !== undefined;
}

export function isUserActionEvent(event: ChatEvent): event is UserActionEvent {
  return (event as UserActionEvent).descriptionKey !== undefined;
}

export function isServerChatEvent(event: ChatEvent): event is ServerChatEvent {
  return (event as ServerChatEvent).id !== undefined;
}
