import {lazy} from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const BubbleChoiceEntryPoint: Lab2EntryPoint = {
  themes: ['Light', 'Dark'],
  view: lazy(() =>
    import(/* webpackChunkName: "bubbleChoice" */ './index.js').then(
      ({BubbleChoice}) => ({
        default: BubbleChoice,
      })
    )
  ),
};
