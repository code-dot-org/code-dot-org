import React, {lazy} from 'react';

import {Lab2EntryPoint, Theme} from '@cdo/apps/lab2/types';

export const PythonlabEntryPoint: Lab2EntryPoint = {
  backgroundMode: false,
  hardcodedEntryPoint: <div />,
  entryPoint: lazy(() =>
    import(/* webpackChunkName: "pythonlab" */ './index.js').then(
      ({PythonlabView}) => ({
        default: PythonlabView,
      })
    )
  ),
  theme: Theme.DARK,
};
