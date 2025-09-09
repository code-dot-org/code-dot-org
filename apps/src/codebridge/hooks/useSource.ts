import {CodebridgeLevelProperties} from '@codebridge/types';
import {prepareSourceForLevelbuilderSave} from '@codebridge/utils';
import {useEffect, useMemo, useRef} from 'react';

import header from '@cdo/apps/code-studio/header';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {setProjectSource} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {setAndSaveProjectSources} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

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
  const source = useAppSelector(
    state => state.lab2Project.projectSources?.source as MultiFileSource
  );
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

  const isReadOnly = useAppSelector(isReadOnlyWorkspace);
  const {id: levelId} = levelProperties;

  const setSourceHelper = useMemo(
    () => (newProjectSource: ProjectSources) => {
      const saveFunction = isReadOnly
        ? setProjectSource
        : setAndSaveProjectSources;
      dispatch(saveFunction(newProjectSource));
    },
    [dispatch, isReadOnly]
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

  return {
    startSources,
  };
};
