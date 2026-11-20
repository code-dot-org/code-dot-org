import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import useAuthoredTours from './useAuthoredTours';

// Renders nothing; runs the current level's authored tours for the student.
const AuthoredTourRunner: React.FC = () => {
  useAuthoredTours(useAppSelector(state => state.lab.levelProperties));
  return null;
};

export default AuthoredTourRunner;
