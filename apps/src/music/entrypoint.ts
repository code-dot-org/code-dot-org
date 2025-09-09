import {lazy} from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const MusicEntryPoint: Lab2EntryPoint = {
  themes: ['Dark'],
  view: lazy(() =>
    import(/* webpackChunkName: "music" */ './index.js').then(
      ({MusicViewWrapper}) => ({
        default: MusicViewWrapper,
      })
    )
  ),
};
