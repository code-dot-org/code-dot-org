import React from 'react';

import {getAppOptionsIsBuildingQuizQuestions} from '@cdo/apps/lab2/projects/utils';
import {LabProps} from '@cdo/apps/lab2/types';

// Placeholder views - real building/taking UI isn't built yet.
const Quiz: React.FunctionComponent<LabProps> = () => {
  if (getAppOptionsIsBuildingQuizQuestions()) {
    return <div>This is the quiz question-building page.</div>;
  }
  return <div>This is a Quiz level.</div>;
};

export default Quiz;
