import DanceView from './views/DanceView';
import {OptionsToAvoid, Lab2EntryPoint, Theme} from '@cdo/apps/lab2/types';
import React from 'react';

export const DanceEntryPoint: Lab2EntryPoint = {
  backgroundMode: false,
  theme: Theme.LIGHT,
  view: OptionsToAvoid.UseHardcodedEntryPoint_WARNING_Bloats_Lab2_Bundle,
  hardcodedView: <DanceView />,
};
