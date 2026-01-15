import {isEqual} from 'lodash';
import {useCallback, useEffect, useRef, useState} from 'react';

import {toolboxToWorkspaceBlocks} from '@cdo/apps/blockly/utils/toolbox';
import {clearHeader} from '@cdo/apps/code-studio/headerRedux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  INITIAL_VERSION_ID,
  START_SOURCES,
  TOOLBOX_BLOCKS,
} from '../../constants';
import {
  BlocklyLevelProperties,
  LevelProperties,
  ProjectSources,
  ProjectVersion,
} from '../../types';
import getInitialSources from '../../utils/getInitialSources';
import ProjectManager from '../ProjectManager';
import ProjectManagerFactory from '../ProjectManagerFactory';
import {getAppOptionsEditBlocks} from '../utils';

import configureHeader from './configureHeader';
import setProjectCallbacks from './setProjectCallbacks';

const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;

interface UseSourcesInput<T extends ProjectSources> {
  /** Level properties for the current level */
  levelProperties: LevelProperties;
  /** Default project sources, used if there are no start sources on the level (or when editing start sources). */
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
  /** Update the current project sources. */
  updateSources: (newSources: T, forceSave?: boolean) => void;
  /** Reset the project sources to the start sources. */
  startOver: () => void;

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
  const [versionList, setVersionList] = useState<ProjectVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string>();
  const [hasEdited, setHasEdited] = useState(false);

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
  const loadProject = useCallback(async () => {
    const {usesProjects, id, isProjectLevel} = levelProperties;
    if (!usesProjects) {
      return;
    }
    // Clear out existing data.
    setCurrentSources(undefined);
    setVersionList([]);
    setCurrentVersion(undefined);
    setHasEdited(false);
    await projectManagerRef.current?.cleanUp();

    // Set up new Project Manager.
    projectManagerRef.current = standaloneChannelId
      ? ProjectManagerFactory.getProjectManager(
          standaloneChannelId,
          isProjectLevel || false
        )
      : await ProjectManagerFactory.getProjectManagerForLevel(
          id,
          isProjectLevel || false,
          userId || undefined,
          scriptId || undefined
        );

    // Load and set initial project sources (even if we don't have a project).
    const projectAndSources = await projectManagerRef.current?.load();
    setCurrentSources(
      (getInitialSources(levelProperties, projectAndSources?.sources) as T) ||
        defaultSources
    );

    // No project; return early.
    if (!projectManagerRef.current) return;

    // Load project versions, if needed.
    if (includeVersionHistory) {
      await refreshVersionList(projectManagerRef.current);
    }
    setProjectCallbacks(projectManagerRef.current, dispatch);
  }, [
    levelProperties,
    defaultSources,
    standaloneChannelId,
    userId,
    scriptId,
    includeVersionHistory,
    dispatch,
  ]);

  const refreshVersionList = async (projectManager: ProjectManager) => {
    const versionList = await projectManager.getVersionList(true);
    setVersionList(versionList);
    const latestVersion =
      versionList.find(v => v.isLatest)?.versionId || INITIAL_VERSION_ID;
    setCurrentVersion(latestVersion);
  };

  const reinitializeSources = useCallback(
    (sources: T | undefined) => {
      setCurrentSources(sources);
      onReinitialize?.();
    },
    [onReinitialize]
  );

  const updateSources = useCallback(
    (newSources: T, forceSave = false) => {
      if (!projectManagerRef.current || !isEditable) return;
      setCurrentSources(prev => {
        // Perform a deep equality check to prevent unnecessary re-renders
        if (isEqual(prev, newSources)) {
          return prev;
        }
        setHasEdited(true);
        return newSources;
      });

      projectManagerRef.current?.save(newSources, forceSave);
    },
    [setCurrentSources, isEditable]
  );

  const startOver = useCallback(() => {
    if (!projectManagerRef.current) return;
    const {templateSources, startSources} = levelProperties;
    if (isToolboxMode) {
      return {
        source: toolboxToWorkspaceBlocks(
          (levelProperties as BlocklyLevelProperties).toolboxDefinition
        ),
      };
    }
    const startOverSources = isStartMode
      ? defaultSources
      : ((templateSources || startSources || defaultSources) as ProjectSources);
    projectManagerRef.current.save(startOverSources as T, true);
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
    setIsLoading(true);
    loadProject()
      .catch(error => {
        // TODO: Error handling/UI
        console.error('Error loading project', error);
      })
      .finally(() => setIsLoading(false));
  }, [loadProject]);

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
    startOver,
    versionList,
    currentVersion,
    previewVersion,
    restoreVersion,
    createCommit,
  };
}
