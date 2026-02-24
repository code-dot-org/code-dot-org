import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {ViewMode} from '../../types';
import {endSave, setViewMode} from '../slice';

// Thunk called when a save no-ops (there are no changes to save)
export const onSaveNoop =
  () => (dispatch: AppDispatch, getState: () => RootState) => {
    // Even if no changes were saved, go to the presentation page if the user tried to publish
    // a model card.
    if (getState().aichat.currentSaveType === 'publishModelCard') {
      dispatch(setViewMode(ViewMode.PRESENTATION));
    }
    dispatch(endSave());
  };
