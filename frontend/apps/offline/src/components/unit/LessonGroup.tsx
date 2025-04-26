import React from 'react';

import Accordion from '@code-dot-org/component-library/accordion';

import Lesson from './Lesson';

import moduleStyles from './unit.module.scss';

const LessonGroup: React.FunctionComponent<LessonGroupProps> = ({
  config,
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
            id: config?.key,
            label: config?.properties?.display_name,
            content: (
              <div className={moduleStyles.lessonGroupPanel}>
                {(config?.lessons || []).map((lesson, i) => (
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
