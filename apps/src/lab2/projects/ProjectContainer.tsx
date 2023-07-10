/**
 * Wrapper component for labs that use the project system.
 * This component will create a project manager for the current level and script
 * or channel, and will clean up the project manager on level change or unmount.
 */

import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import Lab2Registry from '../Lab2Registry';
import {setUpWithLevel, setUpWithoutLevel} from '../lab2Redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {getLevelPropertiesPath} from '@cdo/apps/code-studio/progressReduxSelectors';
import {ProgressState} from '@cdo/apps/code-studio/progressRedux';
import {showProjectBackedHeader} from '@cdo/apps/code-studio/headerRedux';

const ProjectContainer: React.FunctionComponent<ProjectContainerProps> = ({
  children,
  channelId,
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
    // The redux types are very complicated, so in order to re-use this variable
    // we are defining it as any.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let promise: any;
    if (currentLevelId && levelPropertiesPath) {
      // If we have a level id, set up the lab with that level. If we also have a channel id,
      // we will load the project based on that channel id, otherwise we will look up a channel id
      // for the level.
      promise = dispatch(
        setUpWithLevel({
          levelId: parseInt(currentLevelId),
          scriptId,
          levelPropertiesPath,
          channelId,
        })
      );
    } else if (channelId) {
      // Otherwise, if we have a channel id, set up the lab using the channel id.
      // This path should only be used for lab pages that don't have a level, such as
      // /projectbeats.
      promise = dispatch(setUpWithoutLevel(channelId));
    }
    dispatch(showProjectBackedHeader());
    return () => {
      // If we have an early return, we will abort the promise in progress.
      // An early return could happen if the level is changed mid-load.
      promise.abort();
    };
  }, [channelId, currentLevelId, scriptId, levelPropertiesPath, dispatch]);

  useEffect(() => {
    window.addEventListener('beforeunload', event => {
      const projectManager = Lab2Registry.getInstance().getProjectManager();
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
