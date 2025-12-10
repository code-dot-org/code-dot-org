import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {ChatEvent, isUserActionEvent} from '../../types';
import {addEventToChatEventsCurrent} from '../slice';

import {logChatEvent} from './logChatEvent';

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

    dispatch(logChatEvent(chatEvent));
  };
