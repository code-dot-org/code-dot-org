import {lazy} from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const StandaloneVideoEntryPoint: Lab2EntryPoint = {
  backgroundMode: false,
  view: lazy(() =>
    import(/* webpackChunkName: "standaloneVideo" */ './index.js').then(
      ({StandaloneVideo}) => ({
        default: StandaloneVideo,
      })
    )
  ),
};
