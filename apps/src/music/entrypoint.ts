import {lazy} from 'react';

import {Lab2EntryPoint, Theme} from '@cdo/apps/lab2/types';

export const MusicEntryPoint: Lab2EntryPoint = {
  backgroundMode: false,
  theme: Theme.DARK,
  view: lazy(() =>
    import(/* webpackChunkName: "music" */ './index.js').then(
      ({MusicView}) => ({
        default: MusicView,
      })
    )
  ),
};
