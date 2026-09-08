import {lazy} from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';

export const QuizEntryPoint: Lab2EntryPoint = {
  view: lazy(() =>
    import(/* webpackChunkName: "quiz" */ './index.js').then(({Quiz}) => ({
      default: Quiz,
    }))
  ),
  themes: ['Light', 'Dark'],
};
