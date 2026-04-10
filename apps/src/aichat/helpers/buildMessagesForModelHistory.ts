import {
  ChatEvent,
  CompletedChatMessage,
  isCompletedChatMessage,
  isNotification,
  AI_TUTOR_VERSION_ACTION_ACCEPT,
  AI_TUTOR_VERSION_ACTION_REJECT,
} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {AiInteractionStatus} from '@cdo/generated-scripts/sharedConstants';

/**
 * Builds the chat message history to send to the AI model, including fake user/assistant
 * messages for accept/reject version action notifications so the AI knows whether its
 * suggested code changes are currently in the project.
 * We give the fake messages a requestId of -1 since they don't correspond to actual model requests.
 * These requests are only used to inform the model of the request history and aren't used elsewhere.
 */
export function buildMessagesForModelHistory(
  chatEvents: ChatEvent[]
): CompletedChatMessage[] {
  return chatEvents.reduce<CompletedChatMessage[]>((acc, event) => {
    if (isCompletedChatMessage(event)) {
      acc.push(event);
    } else if (
      isNotification(event) &&
      (event.notificationType === AI_TUTOR_VERSION_ACTION_ACCEPT ||
        event.notificationType === AI_TUTOR_VERSION_ACTION_REJECT)
    ) {
      const accepted =
        event.notificationType === AI_TUTOR_VERSION_ACTION_ACCEPT;
      const fileList = event.files?.map(f => f.name).join(', ');
      const filesPhrase = fileList ? ` to ${fileList}` : '';

      if (accepted) {
        acc.push({
          role: Role.USER,
          status: AiInteractionStatus.OK,
          chatMessageText: `I accepted your suggested changes${filesPhrase}. Those changes are now in the project.`,
          timestamp: event.timestamp,
          requestId: -1,
        });
      } else {
        // The model is more likely to respect the rejection if we fake both a
        // user and assistant message for the rejection.
        acc.push({
          role: Role.USER,
          status: AiInteractionStatus.OK,
          chatMessageText: `I rejected your suggested changes${filesPhrase}. The current project files in the system context are the accurate state of the project. Your previous suggestions are not included.`,
          timestamp: event.timestamp,
          requestId: -1,
        });
        acc.push({
          role: Role.ASSISTANT,
          status: AiInteractionStatus.OK,
          chatMessageText: `Understood. I'll use the current project files from the system context as the source of truth, not my previous suggestions.`,
          timestamp: event.timestamp,
          requestId: -1,
        });
      }
    }
    return acc;
  }, []);
}
