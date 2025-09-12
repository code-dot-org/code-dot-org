import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {clearChatMessages as clearChatMessagesReducer} from '../slice';

import {addChatEvent} from './addChatEvent';
import {sendAnalytics} from './sendAnalytics';

// User initiated chat clear: perform state reset, add clear chat event, send analytics.
export const clearChatMessagesByUser = () => (dispatch: AppDispatch) => {
  dispatch(clearChatMessagesReducer());
  dispatch(
    addChatEvent({
      timestamp: Date.now(),
      descriptionKey: 'CLEAR_CHAT',
    })
  );
  dispatch(
    sendAnalytics(EVENTS.CHAT_ACTION, {
      action: 'Clear chat history',
    })
  );
};
