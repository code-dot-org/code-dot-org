import {lazy} from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const Game2EntryPoint: Lab2EntryPoint = {
  themes: ['Dark'],
  view: lazy(() =>
    import(/* webpackChunkName: "game2" */ './index.js').then(
      ({Game2View}) => ({
        default: Game2View,
      })
    )
  ),
};
