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
import {setUpForLevel} from '../labRedux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {getLevelPropertiesPath} from '@cdo/apps/code-studio/progressReduxSelectors';
import {ProgressState} from '@cdo/apps/code-studio/progressRedux';
import ProjectManager from './ProjectManager';

const ProjectContainer: React.FunctionComponent<ProjectContainerProps> = ({
  children,
  channelId,
  projectLevelId,
}) => {
  const currentLevelId = useSelector(
    (state: {progress: ProgressState}) => state.progress.currentLevelId
  );
  const scriptId = useSelector(
    (state: {progress: ProgressState}) => state.progress.scriptId || undefined
  );

  const levelPropertiesPath = useSelector(getLevelPropertiesPath);

  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log(
      `in useEffect, currentLevelId: ${currentLevelId}, channelId: ${channelId}`
    );
    console.log('going to set up level');

    let levelPropertiesPathForDispatch = levelPropertiesPath;
    let levelId = currentLevelId ? parseInt(currentLevelId) : undefined;
    if (channelId) {
      levelPropertiesPathForDispatch = `/levels/${projectLevelId}/level_properties`;
      levelId = projectLevelId;
    }
    if (levelId) {
      const promise = dispatch(
        setUpForLevel({
          levelId,
          scriptId,
          levelPropertiesPath: levelPropertiesPathForDispatch,
          channelId,
        })
      );
      return () => {
        // If we have an early return, we will abort the promise in progress.
        // An early return could happen if the level is changed mid-load.
        promise.abort();
      };
    }
  }, [
    channelId,
    currentLevelId,
    scriptId,
    levelPropertiesPath,
    dispatch,
    projectLevelId,
  ]);

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
  projectLevelId?: number;
}

export default ProjectContainer;
