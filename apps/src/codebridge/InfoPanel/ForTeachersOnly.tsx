import React from 'react';

import PredictSolution from '@cdo/apps/lab2/views/components/PredictSolution';
import TeacherOnlyMarkdown from '@cdo/apps/templates/instructions/TeacherOnlyMarkdown';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

const ForTeachersOnly: React.FunctionComponent = () => {
  const teacherMarkdown = useAppSelector(
    state => state.lab.levelProperties?.teacherMarkdown
  );

  return (
    <div>
      <PredictSolution />
      <TeacherOnlyMarkdown content={teacherMarkdown} hideContainer={true} />
    </div>
  );
};

export default ForTeachersOnly;
