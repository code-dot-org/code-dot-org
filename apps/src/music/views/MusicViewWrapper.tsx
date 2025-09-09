import React from 'react';

import {LabProps} from '@cdo/apps/lab2/types';

import MusicView from './MusicView';

/** Temporary functional/TS wrapper around MusicView that satisfies type constraints */
const MusicViewWrapper: React.FC<LabProps> = props => <MusicView {...props} />;

export default MusicViewWrapper;
