import type {PropsWithChildren} from 'react';
import {createContext, useContext, useEffect} from 'react';

import type {AppOptions, LevelProperties} from '@code-dot-org/core/api';
import {useApiClient, useQueryClient} from '@code-dot-org/core/api';

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

/** Explicit inputs to {@link useLoadLab}, resolved by the caller. */
export interface UseLoadLabInput {
  /** Resolved level properties for the current level. */
  levelProperties?: LevelProperties;
  /** Resolved app options for the current level. */
  appOptions?: AppOptions;
  /** Current level id; pre-resolved by the host for standalone projects. */
  levelId?: number;
  /** User being viewed, e.g. a teacher viewing a student. */
  userId?: number;
  /** Script id, when the level is part of a unit. */
  scriptId?: number;
  /** User app options path, when in a script level. */
  userAppOptionsPath?: string;
  /** Channel id for standalone projects / projects without levels. */
  channelId?: string;
}

/**
 * Drives the project/level load: dispatches {@link labActions.loadLab} once the
 * required inputs are present, and aborts the in-flight load if they change
 * (e.g. the level changes mid-load). The API and query clients are injected
 * from context; everything else is supplied explicitly by the caller.
 *
 * This is the host seam for "studio dispatches explicitly": the host resolves
 * the inputs and calls this hook directly. The package does no project loading
 * of its own.
 */
export const useLoadLab = ({
  levelProperties,
  appOptions,
  levelId,
  userId,
  scriptId,
  userAppOptionsPath,
  channelId,
}: UseLoadLabInput) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // If we have a level id, set up the lab with that level. If we also have a
    // channel id, we will load the project based on that channel id, otherwise
    // we will look up a channel id for the level.
    const promise =
      levelId && levelProperties && appOptions
        ? dispatch(
            labActions.loadLab({
              apiClient,
              queryClient,
              appOptions,
              levelId,
              userId,
              scriptId,
              levelProperties,
              userAppOptionsPath,
              channelId,
            }),
          )
        : undefined;

    return () => {
      // Abort the in-flight load if the inputs change before it finishes
      // (e.g. the level changed mid-load).
      promise?.abort();
    };
  }, [
    apiClient,
    queryClient,
    appOptions,
    levelId,
    userId,
    scriptId,
    levelProperties,
    userAppOptionsPath,
    channelId,
    dispatch,
  ]);
};

/**
 * Holds the current project data and metadata. The host owns the project load
 * (it calls {@link useLoadLab} with explicit inputs); this provider only
 * reflects the resulting redux state.
 */
export type ProjectProviderProps = PropsWithChildren;

export const ProjectProvider = ({children}: ProjectProviderProps) => {
  const levelProperties = useMaybeLevelProperties();

  const isStandaloneProjectLevel = !!levelProperties?.isProjectLevel;
  // Only show share and remix if hideShareAndRemix is explicitly false.
  const hideShareAndRemix = levelProperties?.hideShareAndRemix !== false;
  const loadedChannelId = useAppSelector(
    state => state.lab.channel && state.lab.channel.id,
  );
  const isOwnerOfChannel = useAppSelector(
    state => state.lab.channel && state.lab.channel.isOwner,
  );

  const dispatch = useAppDispatch();
  const isReadOnly = useAppSelector(labActions.isReadOnlyWorkspace);

  // When the level changes, reset metadata relating to the project in redux.
  useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, () =>
    dispatch(labProjectActions.resetProjectMetadata()),
  );

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
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
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    // Removed on the way out, and before re-registering for a new `isReadOnly`.
    // Without this the listeners accumulate over a session and each surviving
    // one calls `cleanUp()` again on the same unload.
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
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
