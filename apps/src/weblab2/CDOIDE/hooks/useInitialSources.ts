import {useMemo} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {ProjectSources} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

export const useInitialSources = (defaultSources: ProjectSources) => {
  const labState = useAppSelector(state => state.lab);
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

  const initialSources = useMemo(() => {
    const startSources = labState.levelProperties?.source
      ? labState.levelProperties
      : defaultSources;

    if (isStartMode) {
      return startSources;
    }

    const projectSources = labState.initialSources;
    return projectSources || startSources;
  }, [labState, isStartMode, defaultSources]);

  return initialSources;
};
