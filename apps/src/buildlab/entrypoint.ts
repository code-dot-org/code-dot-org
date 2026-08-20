import {lazy} from 'react';

import type {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const BuildlabEntryPoint: Lab2EntryPoint = {
  view: lazy(() =>
    import(/* webpackChunkName: "buildlab" */ './index.js').then(
      ({BuildlabView}) => ({default: BuildlabView})
    )
  ),
  themes: ['Dark', 'Light'],
};
