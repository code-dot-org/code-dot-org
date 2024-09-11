import {OptionsToAvoid, Lab2EntryPoint, Theme} from '@cdo/apps/lab2/types';
import MusicView from '@cdo/apps/music/views/MusicView'; // avoid hardcoding imports like this in an entrypoint.tsx

export const MusicEntryPoint: Lab2EntryPoint = {
  backgroundMode: true,
  theme: Theme.DARK,
  view: OptionsToAvoid.UseHardcodedView_WARNING_Bloats_Lab2_Bundle,
  hardcodedView: MusicView,
};
