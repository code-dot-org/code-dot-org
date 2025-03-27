import {lazy} from 'react';

import {Lab2EntryPoint, Theme} from '@cdo/apps/lab2/types';

export const AIChatEntryPoint: Lab2EntryPoint = {
  theme: Theme.LIGHT,
  view: lazy(() =>
    import(/* webpackChunkName: "aichat" */ './index.js').then(
      ({AichatView}) => ({
        default: AichatView,
      })
    )
  ),
};
