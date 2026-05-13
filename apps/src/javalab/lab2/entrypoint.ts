import {lazy} from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const JavalabEntryPoint: Lab2EntryPoint = {
  view: lazy(() =>
    import(/* webpackChunkName: "javalab-lab2" */ './index.js').then(
      ({JavaLab2View}) => ({
        default: JavaLab2View,
      })
    )
  ),
  themes: ['Dark', 'Light'],
};
