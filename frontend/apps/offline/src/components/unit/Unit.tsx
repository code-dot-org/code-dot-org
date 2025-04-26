import React from 'react';

import Section from '@code-dot-org/component-library/cms/section';
import {
  Heading2,
  BodyOneText,
} from '@code-dot-org/component-library/typography';

import LessonGroup from './LessonGroup';

import moduleStyles from './unit.module.scss';

export interface UnitProps {
  unitKey: string;
}

/**
 * Renders the Unit overview for a course.
 */
const Unit: React.FunctionComponent<UnitProps> = ({
  data,
  lessonGroups,
  unitKey,
}) => {
  return (
    <div>
      <Section
        backgroundImageUrl={'/images/bg-pattern.png'}
        background="patternPrimary"
      >
        <Heading2>{data?.locale_data?.title}</Heading2>
        <BodyOneText>{data?.locale_data?.description_student}</BodyOneText>
      </Section>
      <div className={moduleStyles.unitContainer}>
        {lessonGroups.map((lesson_group, i) => (
          <LessonGroup
            key={`lesson-group-${i}`}
            unitKey={unitKey}
            config={lesson_group}
            lessonIndex={i + 1}
            open={i === 0}
          />
        ))}
      </div>
    </div>
  );
};

export default Unit;
