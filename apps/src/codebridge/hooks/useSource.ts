import {useMemo, useEffect, useCallback} from 'react';

import header from '@cdo/apps/code-studio/header';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
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
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const initialSources = useInitialSources(defaultSources);
  const levelStartSource = useAppSelector(
    state => state.lab.levelProperties?.source
  );

  const setSource = useMemo(
    () => (newSource: MultiFileSource) => {
      console.log('got new source');
      console.log({newSource});
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
    }
  }, [isStartMode, source]);

  useEffect(() => {
    // We reset the project when the channelId changes, as this means we are on a new level.
    if (initialSources) {
      console.log('updates initial source');
      console.log({initialSources});
      dispatch(setAndSaveProjectSource(initialSources));
    }
  }, [channelId, initialSources, dispatch]);

  return {source, setSource, resetToStartSource};
};
