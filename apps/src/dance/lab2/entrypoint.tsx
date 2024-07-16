import DanceView from './views/DanceView';
import {Lab2Entrypoint, Theme} from '@cdo/apps/lab2/types';
import React from 'react';

export default {
  backgroundMode: false,
  node: <DanceView />,
  theme: Theme.LIGHT,
} as Lab2Entrypoint;
