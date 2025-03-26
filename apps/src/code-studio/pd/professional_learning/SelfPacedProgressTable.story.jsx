import React from 'react';

import {selfPacedCourseConstants} from './constants';
import SelfPacedProgressTable from './SelfPacedProgressTable';

export default {
  component: SelfPacedProgressTable,
};

export const Basic = () => {
  return <SelfPacedProgressTable plCoursesStarted={selfPacedCourseConstants} />;
};
