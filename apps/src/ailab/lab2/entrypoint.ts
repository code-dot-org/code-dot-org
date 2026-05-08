import {lazy} from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const AilabEntryPoint: Lab2EntryPoint = {
  themes: ['Light'],
  view: lazy(() =>
    import(/* webpackChunkName: "ailabLab2" */ './index.js').then(
      ({AilabView}) => ({
        default: AilabView,
      })
    )
  ),
};
