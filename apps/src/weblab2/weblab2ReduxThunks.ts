import {createAsyncThunk} from '@reduxjs/toolkit';

import {addChatEvent} from '@cdo/apps/aichat/redux/thunks/addChatEvent';
import {getNewRemoveId} from '@cdo/apps/aichat/redux/utils';
import {Notification} from '@cdo/apps/aichat/types/chatEvents';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {
  setProjectSourceBeforeAiTutorVersion,
  setSource,
  setViewingAiTutorVersion,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {setAndSaveProjectSources} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {
  MultiFileSource,
  ProjectFile,
  ProjectSources,
} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {RootState} from '@cdo/apps/types/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';
import {AI_SAVED_COMMENT} from '@cdo/apps/weblab2/constants';

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
  {files: ProjectFile[]; commitDescription: string},
  {dispatch: AppDispatch; state: RootState}
>(
  'weblab2/acceptAiTutorVersion',
  async ({files, commitDescription}, thunkAPI) => {
    const state = thunkAPI.getState();
    const sources = state.lab2Project.projectSources;
    const channelId = state.lab.channel?.id;
    if (!channelId || !sources) {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError(
          'Channel ID or project sources not available when accepting AI Tutor version'
        );
      return;
    }
    const sourcesBeforeAiTutorVersion = {
      source: state.lab2Project.projectSourceBeforeAiTutorVersion,
    };

    // Add accept notification.
    const notification: Notification = {
      timestamp: Date.now(),
      removeId: getNewRemoveId(),
      text: "You accepted AI Tutor's changes.",
      notificationType: 'aiTutorVersionActionAccept',
      includeInChatHistory: true,
      files: files,
      commitDescription: commitDescription,
    };
    thunkAPI.dispatch(addChatEvent(notification));
    sendLab2AnalyticsEvent(EVENTS.AI_TUTOR_VERSION_ACCEPTED, {
      numFiles: files.length.toString(),
      fileTypes: files[0].language || '',
    });
    resetAiTutorVersionState(thunkAPI.dispatch);

    // Update current source so that isAiTutorVersionUpdated and isAiTutorVersionCreated are set to false.
    const source = sources.source as MultiFileSource;
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
    const updatedSources = {
      source: updatedSource,
    };
    // Save sources before AI Tutor version if there were any changes to the project since the last saved version.
    await thunkAPI.dispatch(
      setAndSaveProjectSources(
        sourcesBeforeAiTutorVersion as ProjectSources,
        /* forceSave */ true,
        /* forceNewVersion */ true
      )
    );
    // Save AI Tutor version sources.
    await thunkAPI.dispatch(
      setAndSaveProjectSources(
        updatedSources,
        /* forceSave */ true,
        /* forceNewVersion */ true
      )
    );
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (!projectManager) {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError(
          'Project manager not available when accepting AI Tutor version'
        );
      return;
    }
    const newVersionId = projectManager.getCurrentVersionId();
    const aiSavedCommentDescription = AI_SAVED_COMMENT + commitDescription;
    if (newVersionId) {
      const payload = {
        storage_id: channelId,
        version_id: newVersionId,
        comment: aiSavedCommentDescription,
      };

      // Save commit comment.
      try {
        await HttpClient.post(
          '/project_commits',
          JSON.stringify(payload),
          true,
          {
            'Content-Type': 'application/json; charset=UTF-8',
          }
        );
        // Set this boolean to true so if any updates occur, a new version is created and this version remains intact and is not overwritten.
        projectManager.setForceNewVersion(true);
      } catch (error) {
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError('Failure to save commit comment', error as Error);
      }
    }
  }
);

/**
 * Thunk for rejecting AI Tutor changes in weblab2.
 * Reverts to previous source and notifies user of rejection.
 */
export const rejectAiTutorVersion = createAsyncThunk<
  void,
  ProjectFile[],
  {dispatch: AppDispatch; state: RootState}
>('weblab2/rejectAiTutorVersion', async (files, thunkAPI) => {
  const state = thunkAPI.getState();
  const prevSource = state.lab2Project.projectSourceBeforeAiTutorVersion;
  const source = state.lab2Project.projectSources?.source as MultiFileSource;

  // Add reject notification.
  const notification: Notification = {
    timestamp: Date.now(),
    removeId: getNewRemoveId(),
    text: "You rejected AI Tutor's changes.",
    notificationType: 'aiTutorVersionActionReject',
    includeInChatHistory: true,
    files: files,
  };
  thunkAPI.dispatch(addChatEvent(notification));
  sendLab2AnalyticsEvent(EVENTS.AI_TUTOR_VERSION_REJECTED, {
    numFiles: files.length.toString(),
    fileTypes: files[0].language || '',
  });

  // Revert to previous source.
  thunkAPI.dispatch(setSource(prevSource || source));

  resetAiTutorVersionState(thunkAPI.dispatch);
});
