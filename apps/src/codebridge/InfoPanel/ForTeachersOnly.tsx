import React from 'react';

import TeacherOnlyMarkdown from '@cdo/apps/templates/instructions/TeacherOnlyMarkdown';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

const ForTeachersOnly: React.FunctionComponent = () => {
  const teacherMarkdown = useAppSelector(
    state => state.lab.levelProperties?.teacherMarkdown
  );
  return <TeacherOnlyMarkdown content={teacherMarkdown} hideContainer={true} />;
};

export default ForTeachersOnly;
