import {useEffect, useMemo, useRef} from 'react';

import header from '@cdo/apps/code-studio/header';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {
  setAndSaveProjectSource,
  setProjectSource,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useInitialSources} from './useInitialSources';

// Hook for handling the project source for the current level.
// Returns the current project source and a function to save the source.
// This also handles displaying the levelbuilder save button in start mode.
export const useSource = (defaultSources: ProjectSources) => {
  const dispatch = useAppDispatch();
  const projectSource = useAppSelector(
    state => state.lab2Project.projectSource
  );
  const source = projectSource?.source as MultiFileSource;
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const isEditingExemplarMode = getAppOptionsEditingExemplar();
  const initialSources = useInitialSources(defaultSources);
  const levelStartSource = useAppSelector(
    state => state.lab.levelProperties?.startSources
  );
  const templateStartSource = useAppSelector(
    state => state.lab.levelProperties?.templateSources
  );
  const previousLevelIdRef = useRef<number | null>(null);
  const previousInitialSources = useRef<ProjectSources | null>(null);

  // keep track of whatever project the user has set locally. This happens after any change in CodeBridge
  // in the setSource function below
  const localProjectRef = useRef(source);
  // keep an internal version number for the project used in the <Codebridge/> component.
  // This lets us replace the project if it was swapped out externally.
  const projectVersionRef = useRef(0);
  const levelId = useAppSelector(state => state.lab.levelProperties?.id);
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);

  const setSourceHelper = useMemo(
    () => (newProjectSource: ProjectSources) => {
      const saveFunction = isReadOnly
        ? setProjectSource
        : setAndSaveProjectSource;
      dispatch(saveFunction(newProjectSource));
    },
    [dispatch, isReadOnly]
  );

  const setSource = useMemo(
    () => (newSource: MultiFileSource) => {
      localProjectRef.current = newSource;
      setSourceHelper({source: newSource});
    },
    [setSourceHelper]
  );

  const startSource = useMemo(() => {
    // When resetting in start mode, we always use the level start source.
    return {
      source:
        (!isStartMode && templateStartSource) ||
        levelStartSource ||
        (defaultSources.source as MultiFileSource),
    };
  }, [
    defaultSources.source,
    isStartMode,
    templateStartSource,
    levelStartSource,
  ]);

  useEffect(() => {
    if (isStartMode) {
      header.showLevelBuilderSaveButton(() => {
        return {start_sources: source};
      });
    } else if (isEditingExemplarMode) {
      header.showLevelBuilderSaveButton(
        () => ({exemplar_sources: source}),
        'Levelbuilder: Edit Exemplar',
        `/levels/${levelId}/update_exemplar_code`
      );
    }
  }, [isStartMode, isEditingExemplarMode, levelId, source]);

  useEffect(() => {
    // We reset the project when the levelId changes, as this means we are on a new level.
    // We also reset if the initialSources changed; this could occur if we are a teacher
    // viewing a student's project.
    if (
      (levelId && previousLevelIdRef.current !== levelId) ||
      initialSources !== previousInitialSources.current
    ) {
      if (initialSources) {
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

  return {source, setSource, startSource, projectVersion};
};
