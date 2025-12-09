import {lazy} from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const Weblab2EntryPoint: Lab2EntryPoint = {
  themes: ['Dark', 'Light'],
  view: lazy(() =>
    import(/* webpackChunkName: "weblab2" */ './index.js').then(
      ({Weblab2View}) => ({
        default: Weblab2View,
      })
    )
  ),
};
