import {lazy} from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const SpriteLab2EntryPoint: Lab2EntryPoint = {
  themes: ['Light', 'Dark'],
  view: lazy(() =>
    import(/* webpackChunkName: "spriteLab2" */ './index.js').then(
      ({SpriteLab2View}) => ({
        default: SpriteLab2View,
      })
    )
  ),
};
