import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {endSave} from '../../slice';
import {getNewMessageId} from '../../utils';
import {addChatEvent} from '../addChatEvent';

export const dispatchSaveFailNotification = (
  dispatch: AppDispatch,
  errorMessage: string,
  includeInChatHistory?: boolean
) => {
  const errorNotification = {
    id: getNewMessageId(),
    text: errorMessage,
    notificationType: 'error',
    timestamp: Date.now(),
    includeInChatHistory,
  };
  dispatch(addChatEvent(errorNotification));

  // Notify the UI that the save is complete.
  dispatch(endSave());
};
