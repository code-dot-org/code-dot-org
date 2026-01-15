import {
  setProjectUpdatedAt,
  setProjectUpdatedError,
  setProjectUpdatedSaved,
  setProjectUpdatedSaving,
} from '@cdo/apps/code-studio/projectRedux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {setChannel} from '../../lab2Redux';
import {setProjectTooLarge} from '../../redux/lab2ProjectRedux';
import ProjectManager from '../ProjectManager';

export default function setProjectCallbacks(
  projectManager: ProjectManager,
  dispatch: AppDispatch
) {
  projectManager.addSaveStartListener(() =>
    dispatch(setProjectUpdatedSaving())
  );
  projectManager.addSaveSuccessListener(channel => {
    dispatch(setProjectUpdatedAt(channel.updatedAt));
    dispatch(setChannel(channel));
    // If we had a successful save, we know the project is not too large.
    dispatch(setProjectTooLarge(false));
  });
  projectManager.addSaveNoopListener(channel => {
    if (channel) {
      dispatch(setProjectUpdatedAt(channel.updatedAt));
      dispatch(setChannel(channel));
    } else {
      dispatch(setProjectUpdatedSaved());
    }
  });
  projectManager.addSaveFailListener(error => {
    dispatch(setProjectUpdatedError());
    if (error.message?.includes('413')) {
      // The user's project is too large to save. Mark it as too large.
      dispatch(setProjectTooLarge(true));
    }
  });
}
