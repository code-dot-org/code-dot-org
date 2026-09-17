import {lazy} from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const AdaptiveEntryPoint: Lab2EntryPoint = {
  themes: ['Light', 'Dark'],
  view: lazy(() =>
    import(/* webpackChunkName: "adaptive" */ './index.js').then(
      ({AdaptiveView}) => ({
        default: AdaptiveView,
      })
    )
  ),
};
