import {useMemo, useEffect, useCallback, useRef} from 'react';

import header from '@cdo/apps/code-studio/header';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {setAndSaveProjectSource} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
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

  const setSource = useMemo(
    () => (newSource: MultiFileSource) => {
      dispatch(setAndSaveProjectSource({source: newSource}));
    },
    [dispatch]
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
        dispatch(setAndSaveProjectSource(initialSources));
      }
      if (levelId) {
        previousLevelIdRef.current = levelId;
      }
    }
  }, [initialSources, dispatch, levelId]);

  return {source, setSource, resetToStartSource};
};
