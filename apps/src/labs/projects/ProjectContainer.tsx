/**
 * Wrapper component for labs that use the project system.
 * This component will create a project manager for the current level and script
 * or channel, and will clean up the project manager on level change or unmount.
 */

import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import ProjectManagerFactory from '@cdo/apps/labs/projects/ProjectManagerFactory';
import {ProjectManagerStorageType} from '@cdo/apps/labs/types';
import LabRegistry from '../LabRegistry';
import {loadProject, setUpForLevel} from '../labRedux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {getLevelPropertiesPath} from '@cdo/apps/code-studio/progressReduxSelectors';

const ProjectContainer: React.FunctionComponent<ProjectContainerProps> = ({
  children,
  channelId,
}) => {
  const currentLevelId = useSelector(
    // TODO: Convert progress redux to typescript so this can be typed better
    (state: {progress: {currentLevelId: string}}) =>
      state.progress.currentLevelId
  );
  // TODO: Convert progress redux to typescript so this can be typed better
  const scriptId = useSelector(
    (state: {progress: {scriptId: number}}) => state.progress.scriptId
  );

  const levelPropertiesPath = useSelector(getLevelPropertiesPath);

  const dispatch = useAppDispatch();

  useEffect(() => {
    // If we have a channel id, create a project manager with that channel id.
    // Otherwise, dispatch an action which will create a
    // project manager for the current level id and script.

    // The redux types are very complicated, so in order to re-use this variable
    // we are defining it as any.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let promise: any;
    if (channelId) {
      LabRegistry.getInstance().setProjectManager(
        ProjectManagerFactory.getProjectManager(
          ProjectManagerStorageType.REMOTE,
          channelId
        )
      );
      promise = dispatch(loadProject());
    } else {
      promise = dispatch(
        setUpForLevel({
          levelId: parseInt(currentLevelId),
          scriptId,
          levelPropertiesPath,
        })
      );
    }
    return () => {
      // If we have an early return, we will abort the promise in progress.
      // An early return could happen if the level is changed mid-load.
      promise.abort();
    };
  }, [channelId, currentLevelId, scriptId, levelPropertiesPath, dispatch]);

  useEffect(() => {
    window.addEventListener('beforeunload', event => {
      const projectManager = LabRegistry.getInstance().getProjectManager();
      // Force a save before the page unloads, if there are unsaved changes.
      // If we need to force a save, prevent navigation so we can save first.
      if (projectManager?.hasUnsavedChanges()) {
        projectManager.cleanUp();
        event.preventDefault();
        event.returnValue = '';
      }
    });
  }, []);

  return <>{children}</>;
};

interface ProjectContainerProps {
  children: React.ReactNode;
  channelId?: string;
}

export default ProjectContainer;
