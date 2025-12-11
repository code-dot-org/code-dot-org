import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {
  AiInteractionStatus,
  AiRequestExecutionStatus,
} from '@cdo/generated-scripts/sharedConstants';

import {ExecutionStatus, PendingChatMessage} from './types';

/**
 * Get the updated user and assistant message based on the status of the chat completion request.
 * Returns a CompletedChatMessage without a request ID (added by the caller).
 */
export function getUpdatedMessages(
  userMessage: PendingChatMessage,
  modelResponse: string,
  executionStatus: ExecutionStatus
) {
  switch (executionStatus) {
    case AiRequestExecutionStatus.SUCCESS:
      return [
        {
          ...userMessage,
          status: AiInteractionStatus.OK,
        },
        {
          chatMessageText: modelResponse,
          role: Role.ASSISTANT,
          timestamp: Date.now(),
          status: AiInteractionStatus.OK,
        },
      ];
    case AiRequestExecutionStatus.USER_PROFANITY:
      return [
        {
          ...userMessage,
          status: AiInteractionStatus.PROFANITY_VIOLATION,
        },
      ];
    case AiRequestExecutionStatus.USER_PII:
      return [
        {
          ...userMessage,
          status: AiInteractionStatus.PII_VIOLATION,
        },
      ];
    case AiRequestExecutionStatus.MODEL_PROFANITY:
      return [
        {
          ...userMessage,
          status: AiInteractionStatus.ERROR,
        },
        {
          chatMessageText: modelResponse,
          role: Role.ASSISTANT,
          timestamp: Date.now(),
          status: AiInteractionStatus.PROFANITY_VIOLATION,
        },
      ];
    case AiRequestExecutionStatus.FAILURE:
    case AiRequestExecutionStatus.MODEL_PII:
      return [
        {
          ...userMessage,
          status: AiInteractionStatus.ERROR,
        },
        {
          chatMessageText: modelResponse,
          role: Role.ASSISTANT,
          timestamp: Date.now(),
          status: AiInteractionStatus.ERROR,
        },
      ];
    case AiRequestExecutionStatus.USER_INPUT_TOO_LARGE:
      return [
        {
          ...userMessage,
          status: AiInteractionStatus.USER_INPUT_TOO_LARGE,
        },
        {
          chatMessageText: modelResponse,
          role: Role.ASSISTANT,
          timestamp: Date.now(),
          status: AiInteractionStatus.USER_INPUT_TOO_LARGE,
        },
      ];
    case AiRequestExecutionStatus.MODEL_TIMEOUT:
      return [
        {
          ...userMessage,
          status: AiInteractionStatus.MODEL_TIMEOUT,
        },
        {
          chatMessageText: modelResponse, // Note that this message (and the ones above) are overwritten in the ChatMessageView component.
          role: Role.ASSISTANT,
          timestamp: Date.now(),
          status: AiInteractionStatus.MODEL_TIMEOUT,
        },
      ];
    default:
      throw new Error(`Unexpected status: ${executionStatus}`);
  }
}
