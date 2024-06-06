import {useMemo, useEffect, useCallback, useRef} from 'react';

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
    state => state.lab.levelProperties?.source
  );
  const previousLevelIdRef = useRef<number | null>(null);
  const levelId = useAppSelector(state => state.lab.levelProperties?.id);
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);

  const setSourceHelper = useMemo(
    () => (newProjectSource: ProjectSources) => {
      if (isReadOnly) {
        // Don't attempt to save in read-only mode.
        dispatch(setProjectSource(newProjectSource));
      } else {
        dispatch(setAndSaveProjectSource(newProjectSource));
      }
    },
    [dispatch, isReadOnly]
  );

  const setSource = useMemo(
    () => (newSource: MultiFileSource) => {
      setSourceHelper({source: newSource});
    },
    [setSourceHelper]
  );

  const resetToStartSource = useCallback(() => {
    setSource(levelStartSource || (defaultSources.source as MultiFileSource));
  }, [defaultSources.source, levelStartSource, setSource]);

  useEffect(() => {
    if (isStartMode) {
      header.showLevelBuilderSaveButton(() => {
        return {source};
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
    if (levelId && previousLevelIdRef.current !== levelId) {
      // We reset the project when the levelId changes, as this means we are on a new level.
      if (initialSources) {
        setSourceHelper(initialSources);
      }
      if (levelId) {
        previousLevelIdRef.current = levelId;
      }
    }
  }, [initialSources, levelId, setSourceHelper]);

  return {source, setSource, resetToStartSource};
};
