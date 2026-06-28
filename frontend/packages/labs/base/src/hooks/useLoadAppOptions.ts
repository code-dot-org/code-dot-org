import {useApiClient, useAppOptions} from '@code-dot-org/core/api';

import {useAppSelector} from '../redux/store';

export const useLoadAppOptions = () => {
  const levelId = useAppSelector(({progress}) => progress.currentLevelId);

  const api = useApiClient();

  const {data: appOptions, isLoading: isAppOptionsLoading} = useAppOptions(
    api,
    {levelId: levelId!},
    {enabled: levelId !== undefined},
  );

  return {
    isAppOptionsLoading,
    appOptions,
  };
};
