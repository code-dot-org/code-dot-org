import React from 'react';

import Accordion from '@code-dot-org/component-library/accordion';
import {LinkButton} from '@code-dot-org/component-library/button';
import {Heading5} from '@code-dot-org/component-library/typography';
import type {Lesson} from '@code-dot-org/models/lessons';

import JointIcon from '@/icons/JointIcon';
import WireEndIcon from '@/icons/WireEndIcon';
import WireIcon from '@/icons/WireIcon';

import moduleStyles from './unit.module.scss';

interface LessonOverviewProps {
  unitKey: string;
  lesson: Lesson;
}

const LessonOverview: React.FunctionComponent<LessonOverviewProps> = ({
  unitKey,
  lesson,
}) => {
  return (
    <div className={moduleStyles.lessonOverview}>
      {(lesson?.activitySections || []).map((activitySection, i) => {
        const singleLevel = activitySection.from === activitySection.to;
        const isProgression = singleLevel || activitySection.title !== '';
        return (
          <div
            key={`activity-section-${i}`}
            className={moduleStyles.lessonActivitySection}
          >
            <div
              className={isProgression ? undefined : moduleStyles.bareLesson}
            >
              {isProgression && (
                <>
                  <LinkButton
                    type="secondary"
                    disabled={!singleLevel}
                    iconLeft={{
                      iconName: i == 0 ? 'video' : 'desktop',
                      iconStyle: 'solid',
                    }}
                    color="black"
                    href={`/units/${unitKey}/lessons/${lesson.index + 1}/levels/${activitySection.from}`}
                    text={
                      singleLevel
                        ? activitySection.from?.toString() || '0'
                        : `${activitySection.from}-${activitySection.to}`
                    }
                    className={moduleStyles.activityButton}
                  />
                  <Heading5>{activitySection.title}</Heading5>
                </>
              )}
            </div>
            {!singleLevel && (
              <div
                className={moduleStyles.lessonActivitySectionLevelProgression}
              >
                <JointIcon role="presentation" />
                <div>
                  {Array(activitySection.to - activitySection.from + 1)
                    .fill(null)
                    .map((_, i) => {
                      const levelIndex = i + activitySection.from;
                      return (
                        <div key={`lesson-${lesson.index}-level-${levelIndex}`}>
                          <WireIcon role="presentation" />
                          <LinkButton
                            type="secondary"
                            color="black"
                            href={`/units/${unitKey}/lessons/${lesson.index + 1}/levels/${levelIndex}`}
                            text={levelIndex.toString()}
                            data-path={lesson.levels[levelIndex - 1].data?.path}
                            className={
                              lesson.levels[levelIndex - 1].data?.isConcept
                                ? moduleStyles.diamond
                                : undefined
                            }
                          />
                          {levelIndex === activitySection.to && (
                            <WireEndIcon role="presentation" />
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
  lesson: Lesson;
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
