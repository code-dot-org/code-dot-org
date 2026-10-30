import {lazy} from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const SketchlabEntryPoint: Lab2EntryPoint = {
  themes: ['Light', 'Dark'],
  view: lazy(() =>
    import(/* webpackChunkName: "sketchlab" */ './index.js').then(
      ({SketchlabView}) => ({
        default: SketchlabView,
      })
    )
  ),
};
