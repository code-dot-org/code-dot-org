import {lazy} from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const WhiteboardEntryPoint: Lab2EntryPoint = {
  themes: ['Light', 'Dark'],
  view: lazy(() =>
    import(/* webpackChunkName: "whiteboard" */ './index.js').then(
      ({WhiteboardView}) => ({
        default: WhiteboardView,
      })
    )
  ),
};
