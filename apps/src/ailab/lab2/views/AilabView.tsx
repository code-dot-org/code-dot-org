import React from 'react';

import {LabProps} from '@cdo/apps/lab2/types';

import {AilabLevelProperties} from '../types';

import AilabWorkspace from './AilabWorkspace';

/*
  What lab2 renders for an AI Lab level. The lab itself is AilabWorkspace;
  this is where what the level needs from lab2 is gathered for it.
*/
const AilabView: React.FC<LabProps<AilabLevelProperties>> = ({
  levelProperties,
}) => <AilabWorkspace levelProperties={levelProperties} />;

export default AilabView;
