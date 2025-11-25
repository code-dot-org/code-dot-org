import {createAsyncThunk} from '@reduxjs/toolkit';

import {addChatEvent} from '@cdo/apps/aichat/redux/thunks/addChatEvent';
import {getNewRemoveId} from '@cdo/apps/aichat/redux/utils';
import {Notification} from '@cdo/apps/aichat/types/chatEvents';
import {
  setProjectSourceBeforeAiTutorVersion,
  setSource,
  setViewingAiTutorVersion,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {setAiFilePathToPreview, setAiTutorVersionFiles} from './weblab2Redux';

/**
 * Helper function to reset all AI tutor version state.
 */
function resetAiTutorVersionState(dispatch: AppDispatch) {
  dispatch(setViewingAiTutorVersion(false));
  dispatch(setAiFilePathToPreview(undefined));
  dispatch(setProjectSourceBeforeAiTutorVersion(undefined));
  dispatch(setAiTutorVersionFiles(undefined));
}

/**
 * Thunk for accepting AI Tutor changes in weblab2.
 * Removes AI flags from files and notifies user of acceptance.
 */
export const acceptAiTutorVersion = createAsyncThunk<
  void,
  void,
  {dispatch: AppDispatch; state: RootState}
>('weblab2/acceptAiTutorVersion', async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  const source = state.lab2Project.projectSources?.source as MultiFileSource;

  // Add accept notification.
  const notification: Notification = {
    timestamp: Date.now(),
    removeId: getNewRemoveId(),
    text: "You accepted AI Tutor's changes.",
    notificationType: 'success',
    includeInChatHistory: true,
    hideTimestamp: true,
    hideCloseButton: true,
  };
  thunkAPI.dispatch(addChatEvent(notification));

  resetAiTutorVersionState(thunkAPI.dispatch);

  // Update current source so that isAiTutorVersionUpdated and isAiTutorVersionCreated are set to false.
  if (source) {
    const updatedSource = {
      ...source,
      files: Object.fromEntries(
        Object.entries(source.files).map(([fileId, file]) => [
          fileId,
          {
            ...file,
            isAiTutorVersionUpdated: false,
            isAiTutorVersionCreated: false,
          },
        ])
      ),
    };
    thunkAPI.dispatch(setSource(updatedSource));
  }
});

/**
 * Thunk for rejecting AI Tutor changes in weblab2.
 * Reverts to previous source and notifies user of rejection.
 */
export const rejectAiTutorVersion = createAsyncThunk<
  void,
  void,
  {dispatch: AppDispatch; state: RootState}
>('weblab2/rejectAiTutorVersion', async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  const prevSource = state.lab2Project.projectSourceBeforeAiTutorVersion;
  const source = state.lab2Project.projectSources?.source as MultiFileSource;

  // Add reject notification.
  const notification: Notification = {
    timestamp: Date.now(),
    removeId: getNewRemoveId(),
    text: "You rejected AI Tutor's changes.",
    notificationType: 'error',
    includeInChatHistory: true,
    hideTimestamp: true,
    hideCloseButton: true,
  };
  thunkAPI.dispatch(addChatEvent(notification));

  // Revert to previous source.
  thunkAPI.dispatch(setSource(prevSource || source));

  resetAiTutorVersionState(thunkAPI.dispatch);
});
