import React from 'react';

import AichatView from '@cdo/apps/aichat/views/AichatView';
import {Lab2EntryPoint, Theme} from '@cdo/apps/lab2/types';

export const AIChatEntryPoint: Lab2EntryPoint = {
  backgroundMode: false,
  node: <AichatView />,
  theme: Theme.LIGHT,
};
