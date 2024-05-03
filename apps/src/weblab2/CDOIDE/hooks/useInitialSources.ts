import {useMemo} from 'react';

import {PartialAppOptions} from '@cdo/apps/lab2/projects/utils';
import {ProjectSources} from '@cdo/apps/lab2/types';
import getScriptData from '@cdo/apps/util/getScriptData';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

export const useInitialSources = (defaultSources: ProjectSources) => {
  const labState = useAppSelector(state => state.lab);
  const appOptions = getScriptData('appoptions') as PartialAppOptions;
  const isStartMode = appOptions.editBlocks === 'start_sources';

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
