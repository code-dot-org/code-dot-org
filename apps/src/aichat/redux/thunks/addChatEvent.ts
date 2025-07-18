import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import ChatEventLogger from '../../chatEventLogger';
import {
  ChatEvent,
  isModelUpdate,
  isNotification,
  isUserActionEvent,
} from '../../types';
import {addEventToChatEventsCurrent} from '../slice';

// This thunk adds a chat event to chatEventsCurrent (displayed in current chat workspace) if visible.
// Then it logs the event to the backend for all chat events except notifications with includeInHistory != true.
// It also excludes logging to both frontend and backend if the teacher is viewing as a student.
export const addChatEvent =
  <T extends ChatEvent>(chatEvent: T) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    // Do not show in chat window for UserActionEvents (eg, clear chat),
    // which are hidden from participants and only displayed in teacher view of student chat history.
    if (!isUserActionEvent(chatEvent)) {
      dispatch(addEventToChatEventsCurrent(chatEvent));
    }

    // Do not log to backend if a teacher is viewing a student's work,
    // and for most Notifications (exception being when a student fully reset's their project).
    if (
      getState().progress.viewAsUserId ||
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

    ChatEventLogger.getInstance().logChatEvent(chatEvent);
  };
