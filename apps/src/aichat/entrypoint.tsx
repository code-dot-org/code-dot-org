import React from 'react';

import AichatView from '@cdo/apps/aichat/views/AichatView';
import {Lab2EntryPoint, Theme} from '@cdo/apps/lab2/types';

export default {
  backgroundMode: false,
  node: <AichatView />,
  theme: Theme.LIGHT,
} as Lab2EntryPoint;
