import {lazy} from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const PanelsEntryPoint: Lab2EntryPoint = {
  view: lazy(() =>
    import(/* webpackChunkName: "panels" */ './index.js').then(
      ({PanelsLabView}) => ({
        default: PanelsLabView,
      })
    )
  ),
};
