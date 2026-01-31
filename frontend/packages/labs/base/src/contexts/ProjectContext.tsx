import type {PropsWithChildren} from 'react';
import {createContext, useContext, useEffect} from 'react';

import {useApiClient} from '@code-dot-org/core/api';
import {progressActions} from '@code-dot-org/progress/redux';

import useLifecycleNotifier from '../hooks/useLifecycleNotifier';
import LabRegistry from '../LabRegistry';
import {LifecycleEvent} from '../LifecycleNotifier';
import {labActions, labProjectActions} from '../redux';
import {useAppDispatch, useAppSelector} from '../redux/store';

import {useMaybeLevelProperties} from './LevelPropertiesContext';

/**
 * Describes the state of the current project.
 */
export interface ProjectContent {
  isReadOnly: boolean;
  isStandaloneProjectLevel: boolean;
}

/**
 * The current lab project data and metadata.
 */
const ProjectContext = createContext<ProjectContent>({
  isReadOnly: false,
  isStandaloneProjectLevel: false,
});

/**
 * This hook returns the project data to a consumer.
 */
export const useProject = () => {
  return useContext(ProjectContext);
};

export interface ProjectProviderProps extends PropsWithChildren {
  /** Channel ID for the project, if already known. Used for standalone projects and projects without levels. */
  channelId?: string;
}

/**
 * Holds the current project data and metadata.
 */
export const ProjectProvider = ({
  channelId,
  children,
}: ProjectProviderProps) => {
  const apiClient = useApiClient();
  const levelProperties = useMaybeLevelProperties();
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const userId = useAppSelector(
    state => state.progress.viewAsUserId || undefined,
  );
  const scriptId = useAppSelector(
    state => state.progress.scriptId || undefined,
  );

  const isStandaloneProjectLevel = !!levelProperties?.isProjectLevel;
  // Only show share and remix if hideShareAndRemix is explicitly false.
  const hideShareAndRemix = levelProperties?.hideShareAndRemix !== false;
  const loadedChannelId = useAppSelector(
    state => state.lab.channel && state.lab.channel.id,
  );
  const isOwnerOfChannel = useAppSelector(
    state => state.lab.channel && state.lab.channel.isOwner,
  );

  const userAppOptionsPath = useAppSelector(
    progressActions.getUserAppOptionsPath,
  );

  const dispatch = useAppDispatch();
  const isReadOnly = useAppSelector(labActions.isReadOnlyWorkspace);

  // When the level changes, reset metadata relating to the project in redux.
  useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, () =>
    dispatch(labProjectActions.resetProjectMetadata()),
  );

  useEffect(() => {
    // Before loading, clear the header so we don't accidentally show share and remix
    // for a level that does not allow it.
    // TODO: the header hooks come later
    //dispatch(clearHeader());

    // If we have a level id, set up the lab with that level. If we also have a channel id,
    // we will load the project based on that channel id, otherwise we will look up a channel id
    // for the level.
    const promise =
      currentLevelId && levelProperties
        ? dispatch(
            labActions.setUpWithLevel({
              apiClient,
              levelId: currentLevelId,
              userId,
              scriptId,
              levelProperties,
              userAppOptionsPath,
              channelId,
            }),
          )
        : undefined;

    return () => {
      // If we have an early return, we will abort the promise in progress.
      // An early return could happen if the level is changed mid-load.
      promise?.abort();
    };
  }, [
    apiClient,
    channelId,
    currentLevelId,
    scriptId,
    levelProperties,
    userAppOptionsPath,
    dispatch,
    userId,
  ]);

  useEffect(() => {
    window.addEventListener('beforeunload', event => {
      const projectManager = LabRegistry.projectManager;
      // Force a save before the page unloads, if there are unsaved changes.
      // If we need to force a save, prevent navigation so we can save first.
      // We skip this if we are already force reloading, as that will occur when
      // saving already encountered an issue. We also can skip this in read only mode,
      // as we never save in read only mode.
      if (
        projectManager &&
        !projectManager.isForceReloading() &&
        projectManager.hasUnsavedChanges() &&
        !isReadOnly
      ) {
        projectManager.cleanUp();
        event.preventDefault();
        event.returnValue = '';
      }
    });
  }, [isReadOnly]);

  useEffect(() => {
    // Ensure the header is cleared when we have a change,
    // then possibly load a new header if the level has one.
    // TODO: header hook
    //dispatch(clearHeader());
    // If there is no channel, we can't load a header.
    if (loadedChannelId && isOwnerOfChannel) {
      if (isStandaloneProjectLevel) {
        // Standalone projects see project header (includes rename option).
        // Standalone projects always show share and remix.
        // TODO: header hook
        //header.showProjectHeader();
        console.log('header.showProjectHeader');
      } else {
        // Project backed levels see project backed header, which can
        // conditionally show share and remix.
        // TODO: header hook
        /*header.showHeaderForProjectBacked({
          showShareAndRemix: !hideShareAndRemix,
        });*/
        console.log('header.showHeaderForProjectBacked');
      }
    } else if (
      loadedChannelId &&
      !isOwnerOfChannel &&
      isStandaloneProjectLevel
    ) {
      // If we are viewing another user's project, and this is a standalone
      // project, show the minimal project header (project name and remix button).
      // TODO; header hook
      //header.showMinimalProjectHeader();
      console.log('header.showMinimalProjectHeader');
    }
  }, [
    hideShareAndRemix,
    isStandaloneProjectLevel,
    loadedChannelId,
    isOwnerOfChannel,
    dispatch,
  ]);

  return (
    <ProjectContext.Provider
      value={{
        isReadOnly,
        isStandaloneProjectLevel,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;
