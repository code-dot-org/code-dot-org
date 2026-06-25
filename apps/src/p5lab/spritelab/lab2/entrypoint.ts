import {lazy} from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const SpriteLab2EntryPoint: Lab2EntryPoint = {
  // Dark is first, so it's the default theme for this lab (see
  // useInitialLabTheme, which falls back to themes[0]).
  themes: ['Dark', 'Light'],
  view: lazy(() =>
    import(/* webpackChunkName: "spriteLab2" */ './index.js').then(
      ({SpriteLab2View}) => ({
        default: SpriteLab2View,
      })
    )
  ),
};
