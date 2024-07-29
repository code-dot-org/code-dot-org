import {OptionsToAvoid, Lab2EntryPoint, Theme} from '@cdo/apps/lab2/types';

import DanceView from './views/DanceView';

export const DanceEntryPoint: Lab2EntryPoint = {
  backgroundMode: false,
  theme: Theme.LIGHT,
  view: OptionsToAvoid.UseHardcodedView_WARNING_Bloats_Lab2_Bundle,
  hardcodedView: DanceView,
};
