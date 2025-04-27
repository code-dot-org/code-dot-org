import React from 'react';

import Accordion from '@code-dot-org/component-library/accordion';

import type {LessonGroupData} from '@/app/models/unit';

import Lesson from './Lesson';

import moduleStyles from './unit.module.scss';

export interface LessonGroupProps {
  lessonGroup: LessonGroupData;
  unitKey: string;
  open: boolean;
}

const LessonGroup: React.FunctionComponent<LessonGroupProps> = ({
  lessonGroup,
  unitKey,
  open,
}) => {
  return (
    <div>
      <Accordion
        className={moduleStyles.lessonGroupContainer}
        open={open}
        items={[
          {
            id: lessonGroup?.key,
            label: lessonGroup?.title,
            content: (
              <div className={moduleStyles.lessonGroupPanel}>
                {(lessonGroup?.lessons || []).map((lesson, i) => (
                  <Lesson
                    lesson={lesson}
                    unitKey={unitKey}
                    key={`lesson-${i}`}
                    open={i === 0}
                  />
                ))}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default LessonGroup;
