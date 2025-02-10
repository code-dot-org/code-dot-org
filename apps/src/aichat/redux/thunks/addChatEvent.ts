import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import ChatEventLogger from '../../chatEventLogger';
import {
  AichatContext,
  ChatEvent,
  isModelUpdate,
  isNotification,
} from '../../types';
import {addEventToChatEventsCurrent} from '../slice';

// This thunk adds a chat event to chatEventsCurrent (displayed in current chat workspace) if visible, i.e.,
// hideForParticipants != true. Then it logs the event to the backend for all chat events except notifications
// with includeInHistory != true.
export const addChatEvent =
  <T extends ChatEvent>(chatEvent: T) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    // Only visible chat events added to chatEventsCurrent.
    if (!chatEvent.hideForParticipants) {
      dispatch(addEventToChatEventsCurrent(chatEvent));
    }
    // Log chat event to backend.
    const state = getState() as RootState;
    const aichatContext: AichatContext = {
      currentLevelId: parseInt(state.progress.currentLevelId || ''),
      scriptId: state.progress.scriptId,
      channelId: state.lab.channel?.id,
    };
    // Other than notifications that are not included in chat history (save errors not due to profanity),
    // log the chat event to backend.
    if (
      !isNotification(chatEvent) ||
      (isNotification(chatEvent) && chatEvent.includeInChatHistory)
    ) {
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
      ChatEventLogger.getInstance().logChatEvent(chatEvent, aichatContext);
    }
  };
