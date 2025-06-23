import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {endSave} from '../../slice';
import {getNewRemoveId} from '../../utils';
import {addChatEvent} from '../addChatEvent';

export const dispatchSaveFailNotification = (
  dispatch: AppDispatch,
  errorMessage: string,
  includeInChatHistory?: boolean
) => {
  dispatch(
    addChatEvent({
      removeId: getNewRemoveId(),
      text: errorMessage,
      notificationType: 'error',
      timestamp: Date.now(),
      includeInChatHistory,
    })
  );

  // Notify the UI that the save is complete.
  dispatch(endSave());
};
