import {useMemo} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {ProjectSources} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

export const useInitialSources = (defaultSources: ProjectSources) => {
  const labInitialSources = useAppSelector(state => state.lab.initialSources);
  const levelStartSource = useAppSelector(
    state => state.lab.levelProperties?.source
  );
  // We memoize this object so that is doesn't cause an unexpected re-render.
  const projectStartSource = useMemo(
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
