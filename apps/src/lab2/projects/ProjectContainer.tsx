/**
 * Wrapper component for labs that use the project system.
 * This component will create a project manager for the current level and script
 * or channel, and will clean up the project manager on level change or unmount.
 */

import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import Lab2Registry from '../Lab2Registry';
import {
  LabState,
  setUpWithLevel,
  setUpWithoutLevel,
  shouldHideShareAndRemix,
} from '../lab2Redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {getLevelPropertiesPath} from '@cdo/apps/code-studio/progressReduxSelectors';
import {ProgressState} from '@cdo/apps/code-studio/progressRedux';
import header from '@cdo/apps/code-studio/header';
import {clearHeader} from '@cdo/apps/code-studio/headerRedux';
import {AppName} from '../types';

const ProjectContainer: React.FunctionComponent<ProjectContainerProps> = ({
  children,
  channelId,
  appName,
}) => {
  const currentLevelId = useSelector(
    (state: {progress: ProgressState}) => state.progress.currentLevelId
  );
  const scriptId = useSelector(
    (state: {progress: ProgressState}) => state.progress.scriptId || undefined
  );

  const isStandaloneProjectLevel = useSelector(
    (state: {lab: LabState}) => state.lab.levelProperties?.isProjectLevel
  );
  const hideShareAndRemix = useSelector(shouldHideShareAndRemix);
  const loadedChannelId = useSelector(
    (state: {lab: LabState}) => state.lab.channel && state.lab.channel.id
  );
  const isOwnerOfChannel = useSelector(
    (state: {lab: LabState}) => state.lab.channel && state.lab.channel.isOwner
  );

  const levelPropertiesPath = useSelector(getLevelPropertiesPath);

  const dispatch = useAppDispatch();

  useEffect(() => {
    // The redux types are very complicated, so in order to re-use this variable
    // we are defining it as any.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let promise: any;
    // Before loading, clear the header so we don't accidentally show share and remix
    // for a level that does not allow it.
    dispatch(clearHeader());
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
    } else if (channelId && appName) {
      // Otherwise, if we have a channel id, set up the lab using the channel id.
      // This path should only be used for lab pages that don't have a level, such as
      // /projectbeats. App name also must be provided if using this path.
      promise = dispatch(setUpWithoutLevel({channelId, appName}));
    } else if (channelId || appName) {
      console.warn(
        'If loading a lab without a level, channel ID and app name must both be provided'
      );
    }
    return () => {
      // If we have an early return, we will abort the promise in progress.
      // An early return could happen if the level is changed mid-load.
      promise.abort();
    };
  }, [
    channelId,
    appName,
    currentLevelId,
    scriptId,
    levelPropertiesPath,
    dispatch,
  ]);

  useEffect(() => {
    window.addEventListener('beforeunload', event => {
      const projectManager = Lab2Registry.getInstance().getProjectManager();
      // Force a save before the page unloads, if there are unsaved changes.
      // If we need to force a save, prevent navigation so we can save first.
      // We skip this if we are already force reloading, as that will occur when
      // saving already encountered an issue.
      if (
        projectManager &&
        !projectManager.isForceReloading() &&
        projectManager.hasUnsavedChanges()
      ) {
        projectManager.cleanUp();
        event.preventDefault();
        event.returnValue = '';
      }
    });
  }, []);

  useEffect(() => {
    // Ensure the header is cleared when we have a change,
    // then possibly load a new header if the level has one.
    dispatch(clearHeader());
    // If there is no channel, we can't load a header.
    if (loadedChannelId && isOwnerOfChannel) {
      if (isStandaloneProjectLevel) {
        // Standalone projects see project header (includes rename option).
        // Standalone projects always show share and remix.
        header.showProjectHeader();
      } else {
        // Project backed levels see project backed header, which can
        // conditionally show share and remix.
        header.showHeaderForProjectBacked({
          showShareAndRemix: !hideShareAndRemix,
        });
      }
    } else if (
      loadedChannelId &&
      !isOwnerOfChannel &&
      isStandaloneProjectLevel
    ) {
      // If we are viewing another user's project, and this is a standalone
      // project, show the minimal project header (project name and remix button).
      header.showMinimalProjectHeader();
    }
  }, [
    hideShareAndRemix,
    isStandaloneProjectLevel,
    loadedChannelId,
    isOwnerOfChannel,
    dispatch,
  ]);

  return <>{children}</>;
};

interface ProjectContainerProps {
  children: React.ReactNode;
  /** Channel ID for the project, if already known. Used for standalone projects and projects without levels. */
  channelId?: string;
  /**
   * App name for the lab that will be displayed, used only for projects without levels. Must be provided
   * if loading a lab without a level.
   */
  appName?: AppName;
}

export default ProjectContainer;
