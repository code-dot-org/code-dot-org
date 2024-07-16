import React from 'react';

import {Lab2EntryPoint} from '@cdo/apps/lab2/types';
import StandaloneVideo from '@cdo/apps/standaloneVideo/StandaloneVideo';

export const StandaloneVideoEntryPoint: Lab2EntryPoint = {
  backgroundMode: false,
  node: <StandaloneVideo />,
};
