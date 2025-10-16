import {SaveErrorType} from '@cdo/apps/aichat/types';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {endSave, setSaveError} from '../../slice';

export const dispatchSaveFailNotification = (
  dispatch: AppDispatch,
  type: SaveErrorType,
  message?: string
) => {
  dispatch(setSaveError({type, message}));
  // Notify the UI that the save is complete.
  dispatch(endSave());
};
