import React from 'react';
import SelfPacedProgressTable from './SelfPacedProgressTable';
import {selfPacedCourseConstants} from './constants';

export default {
  component: SelfPacedProgressTable,
};

export const Basic = () => {
  return <SelfPacedProgressTable plCoursesStarted={selfPacedCourseConstants} />;
};
