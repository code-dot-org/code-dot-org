import {isEqual} from 'lodash';
import {useCallback, useEffect, useRef, useState} from 'react';

import {toolboxToWorkspaceBlocks} from '@cdo/apps/blockly/utils/toolbox';
import {clearHeader} from '@cdo/apps/code-studio/headerRedux';
import {
  INITIAL_VERSION_ID,
  START_SOURCES,
  TOOLBOX_BLOCKS,
} from '@cdo/apps/lab2/constants';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import ProjectManagerFactory from '@cdo/apps/lab2/projects/ProjectManagerFactory';
import {getSourcesStoreForApp} from '@cdo/apps/lab2/projects/sourcesStoreForApp';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import type {
  BlocklyLevelProperties,
  LevelProperties,
  ProjectSources,
  ProjectVersion,
} from '@cdo/apps/lab2/types';
import getInitialSources from '@cdo/apps/lab2/utils/getInitialSources';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import configureHeader from './configureHeader';
import setProjectCallbacks from './setProjectCallbacks';

const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;
const isLevelEditMode = isStartMode || isToolboxMode;

interface UseSourcesInput<T extends ProjectSources> {
  /** Level properties for the current level */
  levelProperties: LevelProperties;
  /**
   * Default project sources, used if there are no start sources on the level (or when editing start sources).
   * Note: Must be referentially stable (e.g. a module constant or memoized); a fresh object every render will
   * re-trigger loading.
   */
  defaultSources: T;
  /** Standalone project channel (project) ID, if this is a standalone project */
  standaloneChannelId?: string;
  /** Optional callback called when sources are reinitialized (i.e. start over, restoring a version), as opposed to edited directly. */
  onReinitialize?: () => void;
  /** Whether to include version history functionality (previewing, restoring, committing versions) */
  includeVersionHistory?: boolean;
}

interface UseSourcesOutput<T extends ProjectSources> {
  /** If a load is in progress. */
  isLoading: boolean;
  /** If the current sources are editable. */
  isEditable: boolean;
  /** If the user has updated the most recently loaded sources. Reset when reloading sources or restoring a version. */
  hasEdited: boolean;
  /** The current project sources. */
  currentSources: T | undefined;
  /** Update the current project sources. Accepts the new sources, or an updater function. */
  updateSources: (
    newSourcesOrUpdater: T | ((prev: T | undefined) => T),
    forceSave?: boolean
  ) => void;
  /** Shallow-merge a patch into the latest sources. */
  patchSources: (patch: Partial<T>, forceSave?: boolean) => void;
  /** Reset the project sources to the start sources. */
  startOver: () => void;
  /** Error that occurred during loading sources, if any. */
  loadError?: Error;

  /** Version History fields (empty/no-ops if includeVersionHistory is false) **/

  /** List of all versions for the current project. */
  versionList: ProjectVersion[];
  /** The ID of the current version. */
  currentVersion: string | undefined;
  /** Preview (read-only) a specific version of the project. */
  previewVersion: (version: string) => void;
  /** Restore a specific version of the project, to make it the current version. */
  restoreVersion: (version: string) => void;
  /** Create a new commit with the given description. Creates and saves a new project version. */
  createCommit: (description: string) => void;
}

/**
 * A custom hook that manages source loading, the state of the current project sources,
 * and provides source management functionality to labs, including version history
 * functionality (previewing, restoring, committing versions).
 */
export default function useSources<T extends ProjectSources>({
  levelProperties,
  defaultSources,
  standaloneChannelId,
  onReinitialize,
  includeVersionHistory = false,
}: UseSourcesInput<T>): UseSourcesOutput<T> {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(state => state.progress.viewAsUserId);
  const scriptId = useAppSelector(state => state.progress.scriptId);
  const projectManagerRef = useRef<ProjectManager | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [currentSources, setCurrentSources] = useState<T>();
  // Synchronous mirror of currentSources: written concurrently with
  // setCurrentSources so updater-form updates and getSources always see the latest value.
  const currentSourcesRef = useRef<T>();
  const setSources = useCallback((sources: T | undefined) => {
    currentSourcesRef.current = sources;
    setCurrentSources(sources);
  }, []);
  const [versionList, setVersionList] = useState<ProjectVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string>();
  const [hasEdited, setHasEdited] = useState(false);
  const [loadError, setLoadError] = useState<Error>();

  const isOwner = projectManagerRef.current?.getLastChannel()?.isOwner;

  // Editable if the current user is the project owner and we are not viewing and old version.
  const isEditable =
    (!isLoading &&
      isOwner &&
      (!includeVersionHistory ||
        versionList.find(v => v.versionId === currentVersion)?.isLatest)) ||
    false;

  /**
   * Loads project data and version list (if needed) for current level/user.
   * This is meant to be called whenever the level or view as user changes.
   */
  const loadProject = useCallback(
    // isCancelled returns true when a newer load supersedes this one (e.g. level
    // change mid-load); checked after every await so a slow stale load can't
    // resurrect the previous level's sources or double-attach callbacks.
    async (isCancelled: () => boolean = () => false) => {
      const {usesProjects, id, isProjectLevel} = levelProperties;
      if (!usesProjects) {
        return;
      }
      // Clear out existing data.
      setSources(undefined);
      setVersionList([]);
      setCurrentVersion(undefined);
      setHasEdited(false);
      setLoadError(undefined);
      await projectManagerRef.current?.cleanUp();
      if (isCancelled()) return;

      // Set up new Project Manager, unless we're in level edit mode.
      if (!isLevelEditMode) {
        const sourcesStore = getSourcesStoreForApp(levelProperties.appName);
        // TODO: the lab2Redux thunk also passes isShareView into
        // getProjectManager, currently only used for thumbnail.
        const projectManager = standaloneChannelId
          ? ProjectManagerFactory.getProjectManager(
              standaloneChannelId,
              isProjectLevel || false,
              undefined,
              sourcesStore
            )
          : await ProjectManagerFactory.getProjectManagerForLevel(
              id,
              isProjectLevel || false,
              userId || undefined,
              scriptId || undefined,
              sourcesStore
            );
        // Return early if cancelled; the new load will own the ref.
        if (isCancelled()) return;
        projectManagerRef.current = projectManager;
      }

      // Load and set initial project sources (even if we don't have a project).
      const projectAndSources = await projectManagerRef.current?.load();
      if (isCancelled()) return;
      setSources(
        (getInitialSources(levelProperties, projectAndSources?.sources) as T) ||
          defaultSources
      );

      // No project; return early.
      if (!projectManagerRef.current) return;

      // Load project versions, if needed.
      if (includeVersionHistory) {
        await refreshVersionList(projectManagerRef.current, isCancelled);
        if (isCancelled()) return;
      }
      setProjectCallbacks(projectManagerRef.current, dispatch);
    },
    [
      levelProperties,
      defaultSources,
      standaloneChannelId,
      userId,
      scriptId,
      includeVersionHistory,
      dispatch,
      setSources,
    ]
  );

  const refreshVersionList = async (
    projectManager: ProjectManager,
    isCancelled: () => boolean = () => false
  ) => {
    const versionList = await projectManager.getVersionList(true);
    if (isCancelled()) return;
    setVersionList(versionList);
    const latestVersion =
      versionList.find(v => v.isLatest)?.versionId || INITIAL_VERSION_ID;
    setCurrentVersion(latestVersion);
  };

  const reinitializeSources = useCallback(
    (sources: T | undefined) => {
      setSources(sources);
      onReinitialize?.();
    },
    [setSources, onReinitialize]
  );

  const updateSources = useCallback(
    (
      newSourcesOrUpdater: T | ((prev: T | undefined) => T),
      forceSave = false
    ) => {
      if (!projectManagerRef.current || !isEditable) return;
      // Resolve updaters against the ref, not state: state lags a render, so
      // two quick partial updates would build on the same stale base and
      // drop each other's fields.
      const newSources =
        typeof newSourcesOrUpdater === 'function'
          ? newSourcesOrUpdater(currentSourcesRef.current)
          : newSourcesOrUpdater;
      // Deep equality check to prevent unnecessary re-renders and saves.
      if (isEqual(currentSourcesRef.current, newSources)) {
        return;
      }
      setSources(newSources);
      setHasEdited(true);
      projectManagerRef.current?.save(newSources, forceSave);
    },
    [setSources, isEditable]
  );

  const patchSources = useCallback(
    (patch: Partial<T>, forceSave = false) => {
      updateSources(prev => ({...prev, ...patch} as T), forceSave);
    },
    [updateSources]
  );

  const startOver = useCallback(() => {
    const {templateSources, startSources} = levelProperties;
    const startOverSources = isToolboxMode
      ? {
          source: toolboxToWorkspaceBlocks(
            (levelProperties as BlocklyLevelProperties).toolboxDefinition
          ),
        }
      : isStartMode
      ? defaultSources
      : templateSources || startSources || defaultSources;
    projectManagerRef.current?.save(startOverSources as T, true);
    reinitializeSources(startOverSources as T | undefined);
    setHasEdited(false);
  }, [defaultSources, levelProperties, reinitializeSources]);

  const previewVersion = useCallback(
    async (version: string) => {
      if (!includeVersionHistory || !projectManagerRef.current) return;

      setIsLoading(true);
      await projectManagerRef.current.flushSave();
      const sources = await projectManagerRef.current.loadSources(version);
      reinitializeSources(sources as T | undefined);
      setCurrentVersion(version);
      setIsLoading(false);
    },
    [includeVersionHistory, reinitializeSources]
  );

  const restoreVersion = useCallback(
    async (version: string) => {
      if (!includeVersionHistory || !projectManagerRef.current) return;

      setIsLoading(true);
      await projectManagerRef.current.flushSave();
      const sources = await projectManagerRef.current.restoreSources(version);
      reinitializeSources(sources as T | undefined);
      await refreshVersionList(projectManagerRef.current);
      setHasEdited(false);
      setIsLoading(false);
    },
    [includeVersionHistory, reinitializeSources]
  );

  const createCommit = useCallback(
    async (description: string) => {
      if (!includeVersionHistory || !projectManagerRef.current || !isEditable)
        return;

      setIsLoading(true);
      await projectManagerRef.current.flushSave(/* forceNewVersion */ true);
      const comment = description.trim();
      const newVersionId = projectManagerRef.current.getCurrentVersionId();

      if (!comment || !newVersionId) return; // TODO: Handle no version ID.

      const payload = {
        storage_id: projectManagerRef.current.getChannelId(),
        version_id: newVersionId,
        comment,
      };

      // TODO: Should this be inside ProjectManager?
      await HttpClient.post('/project_commits', JSON.stringify(payload), true, {
        'Content-Type': 'application/json; charset=UTF-8',
      });
      // Set this boolean to true so if any updates occur, a new version is created and this version remains intact and is not overwritten.
      projectManagerRef.current.setForceNewVersion(true);
      await refreshVersionList(projectManagerRef.current);
      setHasEdited(false);
      setIsLoading(false);
    },
    [includeVersionHistory, isEditable]
  );

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    loadProject(() => cancelled)
      .catch(error => {
        if (!cancelled) setLoadError(error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadProject]);

  // Clean up on unmount.
  useEffect(
    () => () => {
      projectManagerRef.current?.cleanUp();
    },
    []
  );

  useEffect(() => {
    dispatch(clearHeader());
    if (projectManagerRef.current && !isLoading) {
      configureHeader(isOwner || false, levelProperties);
    }
  }, [isOwner, levelProperties, dispatch, isLoading]);

  return {
    isLoading,
    isEditable,
    hasEdited,
    currentSources,
    updateSources,
    patchSources,
    startOver,
    loadError,
    versionList,
    currentVersion,
    previewVersion,
    restoreVersion,
    createCommit,
  };
}
