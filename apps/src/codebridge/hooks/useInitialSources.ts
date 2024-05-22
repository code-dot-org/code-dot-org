import {useMemo} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {ProjectSources} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

// Hook for getting the initial sources for the current level.
// If we are in start mode, we show the start sources or the default sources
// if the level has no start sources.
// If the user has a project, we prioritize that over the start sources. If there is
// no project or start sources, we use the default sources.
export const useInitialSources = (defaultSources: ProjectSources) => {
  const labInitialSources = useAppSelector(state => state.lab.initialSources);
  const levelStartSource = useAppSelector(
    state => state.lab.levelProperties?.source
  );
  // We memoize this object so that it doesn't cause an unexpected re-render.
  const projectStartSource: ProjectSources | undefined = useMemo(
    () => (levelStartSource ? {source: levelStartSource} : undefined),
    [levelStartSource]
  );
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

  const initialSources = useMemo(() => {
    const startSources = projectStartSource || defaultSources;

    if (isStartMode) {
      return startSources;
    }

    const projectSources = labInitialSources;
    return projectSources || startSources;
  }, [labInitialSources, projectStartSource, defaultSources, isStartMode]);

  return initialSources;
};
