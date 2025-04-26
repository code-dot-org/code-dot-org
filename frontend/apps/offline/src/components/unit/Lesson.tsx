import React from 'react';

import Accordion from '@code-dot-org/component-library/accordion';
import Button from '@code-dot-org/component-library/button';
import {Heading5} from '@code-dot-org/component-library/typography';

import JointIcon from '@/icons/JointIcon';
import WireEndIcon from '@/icons/WireEndIcon';
import WireIcon from '@/icons/WireIcon';

import moduleStyles from './unit.module.scss';

const LessonOverview: React.FunctionComponent = ({unitKey, lesson}) => {
  return (
    <div className={moduleStyles.lessonOverview}>
      {(lesson?.activitySections || []).map((activitySection, i) => {
        const singleLevel = activitySection.from === activitySection.to;
        return (
          <div
            key={`activity-section-${i}`}
            className={moduleStyles.lessonActivitySection}
          >
            <div>
              <Button
                type="secondary"
                useAsLink={true}
                disabled={!singleLevel}
                iconLeft={{
                  iconName: i == 0 ? 'video' : 'desktop',
                  iconStyle: 'solid',
                }}
                color="black"
                href={`/units/${unitKey}/lessons/${lesson.index}/levels/${activitySection.from}`}
                text={
                  singleLevel
                    ? activitySection.from || '0'
                    : `${activitySection.from}-${activitySection.to}`
                }
                style={{
                  width: '5rem',
                  paddingLeft: 0,
                  paddingRight: 0,
                  color: 'var(--text-neutral-primary)',
                }}
              />
              <Heading5>
                {activitySection.properties.name ||
                  activitySection.properties.progression_name}
              </Heading5>
            </div>
            {!singleLevel && (
              <div
                className={moduleStyles.lessonActivitySectionLevelProgression}
              >
                <JointIcon role="presentation" alt="" />
                {Array(activitySection.to - activitySection.from + 1)
                  .fill()
                  .map((_, i) => {
                    const levelIndex = i + activitySection.from;
                    return (
                      <React.Fragment
                        key={`lesson-${lesson.index}-level-${levelIndex}`}
                      >
                        <Button
                          type="secondary"
                          color="black"
                          href={`/units/${unitKey}/lessons/${lesson.index}/levels/${levelIndex}`}
                          useAsLink={true}
                          text={levelIndex}
                        />
                        {levelIndex !== activitySection.to && (
                          <WireIcon role="presentation" alt="" />
                        )}
                        {levelIndex === activitySection.to && (
                          <WireEndIcon role="presentation" alt="" />
                        )}
                      </React.Fragment>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const Lesson: React.FunctionComponent<LessonProps> = ({
  lesson,
  unitKey,
  open,
}) => {
  return (
    <div>
      <Accordion
        open={open}
        items={[
          {
            id: lesson?.key,
            label: lesson?.name,
            content: <LessonOverview lesson={lesson} unitKey={unitKey} />,
          },
        ]}
      />
    </div>
  );
};

export default Lesson;
