import {lazy} from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const AIChatEntryPoint: Lab2EntryPoint = {
  themes: ['Light'],
  view: lazy(() =>
    import(/* webpackChunkName: "aichat" */ './index.js').then(
      ({AichatView}) => ({
        default: AichatView,
      })
    )
  ),
};
