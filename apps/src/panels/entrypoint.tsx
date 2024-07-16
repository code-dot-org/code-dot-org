import React from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';
import PanelsLabView from '@cdo/apps/panels/PanelsLabView';

export const PanelsEntryPoint: Lab2EntryPoint = {
  backgroundMode: false,
  node: <PanelsLabView />,
};
