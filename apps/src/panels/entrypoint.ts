import {OptionsToAvoid, Lab2EntryPoint} from '@cdo/apps/lab2/types';
import PanelsLabView from '@cdo/apps/panels/PanelsLabView'; // avoid hardcoding imports like this in an entrypoint.tsx

export const PanelsEntryPoint: Lab2EntryPoint = {
  backgroundMode: false,
  view: OptionsToAvoid.UseHardcodedView_WARNING_Bloats_Lab2_Bundle,
  hardcodedView: PanelsLabView,
};
