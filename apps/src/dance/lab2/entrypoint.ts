import {lazy} from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const DanceEntryPoint: Lab2EntryPoint = {
  themes: ['Light', 'Dark'],
  view: lazy(() =>
    import(/* webpackChunkName: "danceLab2" */ './index.js').then(
      ({DanceView}) => ({
        default: DanceView,
      })
    )
  ),
};
