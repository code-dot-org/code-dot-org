import {lazy} from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const PythonlabEntryPoint: Lab2EntryPoint = {
  view: lazy(() =>
    import(/* webpackChunkName: "pythonlab" */ './index.js').then(
      ({PythonlabView}) => ({
        default: PythonlabView,
      })
    )
  ),
  themes: ['Dark', 'Light'],
};
