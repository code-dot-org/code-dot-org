import {useMemo, useEffect} from 'react';

import header from '@cdo/apps/code-studio/header';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {setAndSaveProjectSource} from '@cdo/apps/lab2/lab2Redux';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

// import {useInitialSources} from './useInitialSources';

export const useSource = (defaultSources: ProjectSources) => {
  const dispatch = useAppDispatch();
  const projectSource = useAppSelector(state => state.lab.projectSource);
  const labInitialSources = useAppSelector(state => state.lab.initialSources);
  const source = projectSource?.source as MultiFileSource;
  const levelSource = useAppSelector(
    state => state.lab.levelProperties?.source
  );
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  //const initialSources = useInitialSources(defaultSources);

  // const initialSources = useMemo(() => {
  //   console.log('in useMemo');
  //   const startSources = levelProperties?.source
  //     ? {source: levelProperties.source}
  //     : defaultSources;

  //   if (isStartMode) {
  //     return startSources;
  //   }

  //   const projectSources = labInitialSources;
  //   return projectSources || startSources;
  // }, [levelProperties, labInitialSources, isStartMode, defaultSources]);

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
    console.log('in setup use effect');
    const startSources = levelSource ? {source: levelSource} : defaultSources;

    const initialSources = isStartMode
      ? startSources
      : labInitialSources || startSources;
    // We reset the project when the channelId changes, as this means we are on a new level.
    if (initialSources) {
      setProject(initialSources.source as MultiFileSource);
    }
  }, [
    channelId,
    levelSource,
    isStartMode,
    defaultSources,
    setProject,
    labInitialSources,
  ]);

  return {source, setProject};
};
