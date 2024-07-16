import DanceView from './views/DanceView';
import {Lab2EntryPoint, Theme} from '@cdo/apps/lab2/types';
import React from 'react';

export const DanceEntryPoint: Lab2EntryPoint = {
  backgroundMode: false,
  node: <DanceView />,
  theme: Theme.LIGHT,
};
