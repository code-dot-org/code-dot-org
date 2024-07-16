import React from 'react';

import {Lab2EntryPoint, Theme} from '@cdo/apps/lab2/types';
import Weblab2View from '@cdo/apps/weblab2/Weblab2View';

export default {
  backgroundMode: false,
  node: <Weblab2View />,
  theme: Theme.DARK,
} as Lab2EntryPoint;
