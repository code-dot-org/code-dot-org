import ChatEventLogger from '../chatEventLogger';
import {
  ChatEvent,
  isChatMessage,
  isModelUpdate,
  isNotification,
} from '../types';

// Logs the event to the backend for all chat events except:
// - notifications with includeInHistory != true
// - if the teacher is viewing as a student.
export const logChatEvent = (
  chatEvent: ChatEvent,
  viewAsUserId: number | null
) => {
  // Do not log to backend if a teacher is viewing a student's work,
  // and for most Notifications (exception being when a student fully reset's their project).
  if (
    typeof viewAsUserId === 'number' ||
    (isNotification(chatEvent) && !chatEvent.includeInChatHistory)
  ) {
    return;
  }

  // If a model update, log only the updated value for temperature and selected model id.
  // Do not log free text updated values (e.g., system prompt, retrieval contexts, model card info).
  if (isModelUpdate(chatEvent)) {
    const {updatedField, updatedValue} = chatEvent;
    // Only log updated value for temperature and selected model id - free text values are not logged.
    const updatedValueToLog =
      updatedField === 'temperature' || updatedField === 'selectedModelId'
        ? updatedValue
        : 'N/A';
    chatEvent = {
      ...chatEvent,
      updatedValue: updatedValueToLog,
    };
  }

  // remove hiddenContext from chat event logging
  if (isChatMessage(chatEvent)) {
    delete chatEvent.hiddenContext;
  }

  ChatEventLogger.getInstance().logChatEvent(chatEvent);
};
