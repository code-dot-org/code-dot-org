import {lazy} from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const Javalab2EntryPoint: Lab2EntryPoint = {
  view: lazy(() =>
    import(/* webpackChunkName: "javalab2" */ './index.js').then(
      ({Javalab2View}) => ({
        default: Javalab2View,
      })
    )
  ),
  themes: ['Dark', 'Light'],
};
