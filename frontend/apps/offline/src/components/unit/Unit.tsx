import React from 'react';

import Section from '@code-dot-org/component-library/cms/section';
import {
  Heading2,
  BodyOneText,
} from '@code-dot-org/component-library/typography';
import type {Unit as UnitData} from '@code-dot-org/models/units';

import Lesson from './Lesson';
import LessonGroup from './LessonGroup';

import moduleStyles from './unit.module.scss';

export interface UnitProps {
  unit: UnitData;
}

/**
 * Renders the Unit overview for a course.
 */
const Unit: React.FunctionComponent<UnitProps> = ({unit}) => {
  return (
    <div>
      {/* Render the top header describing the unit */}
      <Section
        backgroundImageUrl={'/images/bg-pattern.png'}
        background="patternPrimary"
      >
        <Heading2>{unit.title}</Heading2>
        <BodyOneText>{unit.description.student}</BodyOneText>
      </Section>

      <div className={moduleStyles.unitContainer}>
        {/* Render lesson groups */}
        {unit.lessonGroups.map((lessonGroup, i) => (
          <LessonGroup
            key={`lesson-group-${i}`}
            unitKey={unit.key}
            lessonGroup={lessonGroup}
            open={i === 0}
          />
        ))}

        {/* Render lessons that are not within a lesson group */}
        {unit.lessons
          .filter(lesson => lesson.lessonGroupIndex === undefined)
          .map(lesson => (
            <Lesson
              key={`lesson-${lesson.index}`}
              unitKey={unit.key}
              lesson={lesson}
              open={lesson.index === 0}
            />
          ))}
      </div>
    </div>
  );
};

export default Unit;
