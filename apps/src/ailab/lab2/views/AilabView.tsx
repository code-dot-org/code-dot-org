import React from 'react';

import {LabProps} from '@cdo/apps/lab2/types';

import {AilabLevelProperties} from '../types';

import AilabWorkspace from './AilabWorkspace';

const AilabView: React.FC<LabProps<AilabLevelProperties>> = ({
  levelProperties,
}) => <AilabWorkspace levelProperties={levelProperties} />;

export default AilabView;
