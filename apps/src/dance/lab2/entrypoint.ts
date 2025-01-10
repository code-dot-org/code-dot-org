import {lazy} from 'react';

import {Lab2EntryPoint, Theme} from '@cdo/apps/lab2/types';

export const DanceEntryPoint: Lab2EntryPoint = {
  backgroundMode: false,
  theme: Theme.LIGHT,
  view: lazy(() =>
    import(/* webpackChunkName: "danceLab2" */ './index.js').then(
      ({DanceView}) => ({
        default: DanceView,
      })
    )
  ),
};
