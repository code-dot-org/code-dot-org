import React from 'react';

import {Lab2Entrypoint, Theme} from '@cdo/apps/lab2/types';

export default {
  backgroundMode: false,
  node: <div />,
  lazyNode: lazy(() =>
    import(/* webpackChunkName: "pythonlab" */ './index.js').then(
      ({PythonlabView}) => ({
        default: PythonlabView,
      })
    )
  ),
  theme: Theme.DARK,
} as Lab2Entrypoint;
