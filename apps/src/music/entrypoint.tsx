import {setUpBlocklyForMusicLab} from '@cdo/apps/music/blockly/setup';
import MusicView from '@cdo/apps/music/views/MusicView';

import {Lab2EntryPoint, Theme} from '@cdo/apps/lab2/types';
import React from 'react';

export const MusicEntryPoint: Lab2EntryPoint = {
  backgroundMode: true,
  node: <MusicView />,
  theme: Theme.DARK,
  setupFunction: setUpBlocklyForMusicLab,
};
