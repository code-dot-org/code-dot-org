import {useApiClient, useAppOptions} from '@code-dot-org/core/api';

import {useAppSelector} from '../redux/store';

/**
 * Fetches app options for the current level (keyed off `state.progress`).
 *
 * Transitional: when the studio host supplies resolved app options to
 * `<LabWithSources>`, the package gates this fetch off (`enabled: false`) and
 * this hook can eventually be removed along with the in-package fetch path.
 */
export const useLoadAppOptions = ({
  enabled = true,
}: {enabled?: boolean} = {}) => {
  const levelId = useAppSelector(({progress}) => progress.currentLevelId);

  const api = useApiClient();

  const {data: appOptions, isLoading: isAppOptionsLoading} = useAppOptions(
    api,
    {levelId: levelId!},
    {enabled: enabled && levelId !== undefined},
  );

  return {
    isAppOptionsLoading,
    appOptions,
  };
};
