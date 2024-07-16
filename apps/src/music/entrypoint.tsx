import {setUpBlocklyForMusicLab} from '@cdo/apps/music/blockly/setup'; // avoid hardcoding imports like this in an entrypoint.tsx
import MusicView from '@cdo/apps/music/views/MusicView'; // avoid hardcoding imports like this in an entrypoint.tsx

import {OptionsToAvoid, Lab2EntryPoint, Theme} from '@cdo/apps/lab2/types';
import React from 'react';

export const MusicEntryPoint: Lab2EntryPoint = {
  backgroundMode: true,
  theme: Theme.DARK,
  setupFunction: setUpBlocklyForMusicLab,
  view: OptionsToAvoid.UseHardcodedEntryPoint_WARNING_Bloats_Lab2_Bundle,
  hardcodedView: <MusicView />,
};
