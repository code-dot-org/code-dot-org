import {useMemo, useEffect} from 'react';

import header from '@cdo/apps/code-studio/header';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {
  setAndSaveProjectSource,
  setProjectSource,
} from '@cdo/apps/lab2/lab2Redux';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

export const useSource = (defaultSources: ProjectSources) => {
  const dispatch = useAppDispatch();
  const projectSource = useAppSelector(state => state.lab.projectSource);
  const labInitialSources = useAppSelector(state => state.lab.initialSources);
  const source = projectSource?.source as MultiFileSource;
  const levelProperties = useAppSelector(state => state.lab.levelProperties);
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

  const initialSources = useMemo(() => {
    const startSources = levelProperties?.source
      ? levelProperties
      : defaultSources;

    if (isStartMode) {
      return startSources;
    }

    const projectSources = labInitialSources;
    return projectSources || startSources;
  }, [levelProperties, labInitialSources, isStartMode, defaultSources]);

  const setProject = useMemo(
    () => (newProject: MultiFileSource) => {
      dispatch(setAndSaveProjectSource({source: newProject}));
    },
    [dispatch]
  );

  useEffect(() => {
    if (isStartMode) {
      header.showLevelBuilderSaveButton(() => {
        return projectSource;
      });
    }
  }, [isStartMode, projectSource]);

  useEffect(() => {
    // We reset the project when the channelId changes, as this means we are on a new level.
    dispatch(
      setProjectSource(
        initialSources?.source ? {source: initialSources?.source} : undefined
      )
    );
  }, [channelId, dispatch, initialSources]);

  return {source, setProject};
};
