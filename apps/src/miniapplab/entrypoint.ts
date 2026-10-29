import {ComponentType, lazy} from 'react';

import {Lab2EntryPoint, LabProps} from '@cdo/apps/lab2/types';

// Not yet registered in lab2EntryPoints: the prototype has no app type, so
// /miniapplab renders the view directly.  Add it there once it has one.
export const MiniAppLabEntryPoint: Lab2EntryPoint = {
  themes: ['Light'],
  view: lazy(() =>
    import(/* webpackChunkName: "miniapplab" */ './index.js').then(
      ({MiniAppLabView}) => ({
        default: MiniAppLabView as ComponentType<LabProps>,
      })
    )
  ),
};
