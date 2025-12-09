import classNames from 'classnames';
import React from 'react';

import {LevelProperties} from '@cdo/apps/lab2/types';
import TeacherOnlyMarkdown from '@cdo/apps/templates/instructions/TeacherOnlyMarkdown';

import PredictSolution from './PredictSolution';

import moduleStyles from './for-teachers-only.module.scss';

const ForTeachersOnly: React.FC<{
  levelProperties: LevelProperties;
  className?: string;
}> = ({levelProperties, className}) => {
  const {teacherMarkdown, predictSettings} = levelProperties;

  return (
    <div className={classNames(moduleStyles.teachersOnlyContainer, className)}>
      <PredictSolution predictSettings={predictSettings} />
      <TeacherOnlyMarkdown content={teacherMarkdown} hideContainer={true} />
    </div>
  );
};

export default ForTeachersOnly;
