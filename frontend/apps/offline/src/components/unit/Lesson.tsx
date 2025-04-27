import React from 'react';

import Accordion from '@code-dot-org/component-library/accordion';
import Button from '@code-dot-org/component-library/button';
import {Heading5} from '@code-dot-org/component-library/typography';

import type {LessonData} from '@/app/models/unit';
import JointIcon from '@/icons/JointIcon';
import WireEndIcon from '@/icons/WireEndIcon';
import WireIcon from '@/icons/WireIcon';

import moduleStyles from './unit.module.scss';

interface LessonOverviewProps {
  unitKey: string;
  lesson: LessonData;
}

const LessonOverview: React.FunctionComponent<LessonOverviewProps> = ({
  unitKey,
  lesson,
}) => {
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
                href={`/units/${unitKey}/lessons/${lesson.index + 1}/levels/${activitySection.from}`}
                text={
                  singleLevel
                    ? activitySection.from || '0'
                    : `${activitySection.from}-${activitySection.to}`
                }
                className={moduleStyles.activityButton}
              />
              <Heading5>{activitySection.title}</Heading5>
            </div>
            {!singleLevel && (
              <div
                className={moduleStyles.lessonActivitySectionLevelProgression}
              >
                <JointIcon role="presentation" alt="" />
                <div>
                  {Array(activitySection.to - activitySection.from + 1)
                    .fill()
                    .map((_, i) => {
                      const levelIndex = i + activitySection.from;
                      return (
                        <div key={`lesson-${lesson.index}-level-${levelIndex}`}>
                          <WireIcon role="presentation" alt="" />
                          <Button
                            type="secondary"
                            color="black"
                            href={`/units/${unitKey}/lessons/${lesson.index + 1}/levels/${levelIndex}`}
                            useAsLink={true}
                            text={levelIndex}
                          />
                          {levelIndex === activitySection.to && (
                            <WireEndIcon role="presentation" alt="" />
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export interface LessonProps {
  lesson: LessonData;
  unitKey: string;
  open: boolean;
}

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
            label: lesson?.title,
            content: <LessonOverview lesson={lesson} unitKey={unitKey} />,
          },
        ]}
      />
    </div>
  );
};

export default Lesson;
