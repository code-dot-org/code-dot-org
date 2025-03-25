import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import React from 'react';

import PredictSolution from '@cdo/apps/lab2/views/components/PredictSolution';
import TeacherOnlyMarkdown from '@cdo/apps/templates/instructions/TeacherOnlyMarkdown';

const ForTeachersOnly: React.FunctionComponent = () => {
  const {levelProperties} = useCodebridgeContext();
  const teacherMarkdown = levelProperties.teacherMarkdown;

  return (
    <div>
      <PredictSolution />
      <TeacherOnlyMarkdown content={teacherMarkdown} hideContainer={true} />
    </div>
  );
};

export default ForTeachersOnly;
