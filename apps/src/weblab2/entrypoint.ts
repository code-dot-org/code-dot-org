import {OptionsToAvoid, Lab2EntryPoint, Theme} from '@cdo/apps/lab2/types';
import Weblab2View from '@cdo/apps/weblab2/Weblab2View'; // avoid hardcoding imports like this in an entrypoint.tsx

export const Weblab2EntryPoint: Lab2EntryPoint = {
  backgroundMode: false,
  theme: Theme.DARK,
  view: OptionsToAvoid.UseHardcodedView_WARNING_Bloats_Lab2_Bundle,
  hardcodedView: Weblab2View,
};
