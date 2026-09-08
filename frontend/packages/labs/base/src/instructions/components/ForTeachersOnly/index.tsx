import type {LevelProperties} from '@code-dot-org/core/api';

import classNames from 'classnames';
import type {FunctionComponent} from 'react';

import PredictSolution from '../PredictSolution';
import TeacherOnlyMarkdown from '../TeacherOnlyMarkdown';

import moduleStyles from './for-teachers-only.module.scss';

const ForTeachersOnly: FunctionComponent<{
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
