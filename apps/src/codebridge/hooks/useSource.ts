import {CodebridgeLevelProperties} from '@codebridge/types';
import {prepareSourceForLevelbuilderSave} from '@codebridge/utils';
import {debounce, isEqual} from 'lodash';
import {useEffect, useMemo, useRef} from 'react';

import header from '@cdo/apps/code-studio/header';
import {sendProgressReport} from '@cdo/apps/code-studio/progressRedux';
import {getCurrentLevel} from '@cdo/apps/code-studio/progressReduxSelectors';
import {TestResults} from '@cdo/apps/constants';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {
  setAndSaveProjectSources,
  setHasEdited,
  setProjectSource,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import {useInitialSources} from './useInitialSources';

// Hook for handling the project source for the current level.
// Returns the current project source and a function to save the source.
// This also handles displaying the levelbuilder save button in start mode.
export const useSource = (
  defaultSources: ProjectSources,
  levelProperties: CodebridgeLevelProperties,
  initiaServerSources: ProjectSources | undefined
) => {
  const dispatch = useAppDispatch();
  const projectSource = useAppSelector(
    state => state.lab2Project.projectSources
  );
  const source = projectSource?.source as MultiFileSource;
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const isEditingExemplarMode = getAppOptionsEditingExemplar();
  const {
    initialSources,
    levelStartSources,
    templateStartSources,
    parsedDefaultSources,
  } = useInitialSources(defaultSources, levelProperties, initiaServerSources);
  const previousLevelIdRef = useRef<number | null>(null);
  const previousInitialSources = useRef<ProjectSources | null>(null);

  // keep track of whatever project the user has set locally. This happens after any change in CodeBridge
  // in the setSource function below
  const localProjectRef = useRef(source);
  // keep an internal version number for the project used in the <Codebridge/> component.
  // This lets us replace the project if it was swapped out externally.
  const projectVersionRef = useRef(0);
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);
  const hasEdited = useAppSelector(state => state.lab2Project.hasEdited);
  const currentLevel = useAppSelector(state => getCurrentLevel(state));
  const {appName, id: levelId} = levelProperties;

  const setSourceHelper = useMemo(
    () => (newProjectSource: ProjectSources) => {
      const saveFunction = isReadOnly
        ? setProjectSource
        : setAndSaveProjectSources;
      dispatch(saveFunction(newProjectSource));
    },
    [dispatch, isReadOnly]
  );

  const debouncedProgressReport = debounce(() => {
    if (appName) {
      dispatch(sendProgressReport(appName, TestResults.LEVEL_STARTED));
    }
  }, 100);

  // We check for the first edit in a given session for 2 reasons:
  // 1. The first time the user edits the project (ever), we mark the level as in-progress.
  // 2. We display the continue button in the instructions for non-validated levels if the user
  //    has made an edit and run their code in the current session.
  const checkForFirstEdit = useMemo(
    () => (newSource: MultiFileSource) => {
      // Only do this check if the user hasn't already edited the project yet,
      // as we are deep comparing the new source to the previous source,
      // and we don't want to do that on every change.
      if (!hasEdited) {
        // We have a very permissive definition of edit; any change in the source counts.
        // This includes moving files, opening/closing files, etc.
        const newSourceHasEdits = !isEqual(newSource, localProjectRef.current);
        if (newSourceHasEdits) {
          dispatch(setHasEdited(true));
          // If the current level status is not tried, send a progress report.
          // We debounce it so we don't send a report for multiple edits in quick succession.
          if (currentLevel && currentLevel.status === LevelStatus.not_tried) {
            debouncedProgressReport();
          }
        }
      }
    },
    [currentLevel, debouncedProgressReport, dispatch, hasEdited]
  );

  const setProject = useMemo(
    () => (newProject: ProjectSources) => {
      const newSource = newProject.source as MultiFileSource;
      checkForFirstEdit(newSource);
      localProjectRef.current = newSource;
      setSourceHelper(newProject);
    },
    [setSourceHelper, checkForFirstEdit]
  );

  const startSources = useMemo(() => {
    return (
      (!isStartMode && templateStartSources) ||
      levelStartSources ||
      parsedDefaultSources
    );
  }, [
    isStartMode,
    templateStartSources,
    levelStartSources,
    parsedDefaultSources,
  ]);

  useEffect(() => {
    if (isStartMode) {
      header.showLevelBuilderSaveButton(() => {
        const {parsedSource, validationFile} =
          prepareSourceForLevelbuilderSave(source);
        return {start_sources: parsedSource, validation_file: validationFile};
      });
    } else if (isEditingExemplarMode) {
      header.showLevelBuilderSaveButton(
        () => ({exemplar_sources: source}),
        'Levelbuilder: Edit Exemplar',
        `/levels/${levelId}/update_exemplar_code`
      );
    }
  }, [isStartMode, isEditingExemplarMode, source, levelId]);

  useEffect(() => {
    // We reset the project when the levelId changes, as this means we are on a new level.
    // We also reset if the initialSources changed; this could occur if we are a teacher
    // viewing a student's project.
    if (
      (levelId && previousLevelIdRef.current !== levelId) ||
      initialSources !== previousInitialSources.current
    ) {
      if (initialSources) {
        // Set the last source in project manager to initial sources.
        // This prevents us from immediately saving the source on load,
        // as we only want to save when the user makes a change.
        // Initial sources always comes from the server, so we never need to save
        // it again.
        Lab2Registry.getInstance()
          .getProjectManager()
          ?.setLastSource(initialSources);
        setSourceHelper(initialSources);
      }
      if (levelId) {
        previousLevelIdRef.current = levelId;
      }
      previousInitialSources.current = initialSources;
    }
  }, [initialSources, levelId, setSourceHelper]);

  // If the source retrieved from redux is the same as our localProject, then there haven't been any external
  // changes so we don't increment the key and keep the current layout in place.
  // However, if the source has changed from our last local save, that means that we've loaded up a new copy
  // from an external source (such as the version history button). In that case, we want to set our localProjectRef
  // to whatever that new source is AND increment our key. This'll ensure that the CodeBridge layout reflows and
  // the project is properly kept in sync.
  const projectVersion = useMemo(() => {
    if (source !== localProjectRef.current) {
      localProjectRef.current = source;
      projectVersionRef.current++;
    }
    return projectVersionRef.current;
  }, [source]);

  return {
    source,
    setProject,
    startSources,
    projectVersion,
    validationFile: levelProperties.validationFile,
    labConfig: projectSource?.labConfig,
  };
};
