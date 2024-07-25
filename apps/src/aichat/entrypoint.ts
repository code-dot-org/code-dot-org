import AichatView from '@cdo/apps/aichat/views/AichatView'; // avoid hardcoding imports like this in an entrypoint.tsx
import {Lab2EntryPoint, OptionsToAvoid, Theme} from '@cdo/apps/lab2/types';

export const AIChatEntryPoint: Lab2EntryPoint = {
  backgroundMode: false,
  theme: Theme.LIGHT,
  view: OptionsToAvoid.UseHardcodedView_WARNING_Bloats_Lab2_Bundle,
  hardcodedView: AichatView,
};
