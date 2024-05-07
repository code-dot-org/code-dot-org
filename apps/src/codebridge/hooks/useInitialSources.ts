import {isEqual} from 'lodash';
import {useMemo} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {ProjectSources} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

export const useInitialSources = (defaultSources: ProjectSources) => {
  const labInitialSources = useAppSelector(
    state => state.lab.initialSources,
    isEqual
  );
  const levelStartSource = useAppSelector(
    state => state.lab.levelProperties?.source,
    isEqual
  );
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

  const initialSources = useMemo(() => {
    console.log({
      levelStartSource,
      defaultSources,
      isStartMode,
      labInitialSources,
    });
    const startSources = levelStartSource
      ? {source: levelStartSource}
      : defaultSources;

    if (isStartMode) {
      return startSources;
    }

    const projectSources = labInitialSources;
    return projectSources || startSources;
  }, [levelStartSource, defaultSources, isStartMode, labInitialSources]);

  return initialSources;
};
