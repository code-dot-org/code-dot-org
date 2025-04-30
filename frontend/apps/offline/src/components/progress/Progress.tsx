'use client';

import classNames from 'classnames';
import React, {useState} from 'react';

import Button from '@code-dot-org/component-library/button';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import Link from '@code-dot-org/component-library/link';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {Heading6} from '@code-dot-org/component-library/typography';

import Unit from '@/components/unit';

import moduleStyles from './progress.module.scss';

export interface ProgressProps {
  unit: object;
  unitKey: string;
  lessonIndex: number;
  levelIndex: number;
  lessonGroups: object;
  lessons: object;
}

const Progress: React.FunctionComponent<ProgressProps> = ({
  unit,
  unitKey,
  lessonIndex,
  levelIndex,
}) => {
  const [openOverview, setOpenOverview] = useState<boolean>(false);

  return (
    <nav className={moduleStyles.progress}>
      <Heading6 className={moduleStyles.progressHeader}>
        <Link href={`/units/${unitKey}`}>
          Lesson {lessonIndex + 1}: {unit.lessons[lessonIndex].title}
        </Link>
      </Heading6>
      <div className={moduleStyles.progressContainer}>
        {levelIndex === 0 && (
          <Button
            className={moduleStyles.progressButton}
            alt="Go back to previous level"
            size="xs"
            color="gray"
            useAsLink
            type="secondary"
            icon={{
              iconName: 'left',
              iconStyle: 'solid',
            }}
            isIconOnly
            disabled
            href={`/units/${unitKey}/lessons/${lessonIndex + 1}/levels/${levelIndex}`}
          />
        )}
        {levelIndex !== 0 && (
          <WithTooltip
            tooltipProps={{
              text:
                levelIndex +
                  '. ' +
                  unit.lessons[lessonIndex].activitySections[
                    unit.lessons[lessonIndex].levels[levelIndex - 1]
                      ?.activitySectionIndex
                  ]?.title || '',
              size: 'm',
              direction: 'onBottom',
              className: moduleStyles.tooltip,
            }}
          >
            <Button
              className={moduleStyles.progressButton}
              alt="Go back to previous level"
              size="xs"
              color="gray"
              useAsLink
              type="secondary"
              icon={{
                iconName: 'left',
                iconStyle: 'solid',
              }}
              isIconOnly
              href={`/units/${unitKey}/lessons/${lessonIndex + 1}/levels/${levelIndex}`}
            />
          </WithTooltip>
        )}
        {unit.lessons[lessonIndex].levels.map((level, i) => (
          <WithTooltip
            key={`progress-lesson-${lessonIndex}-level-${i}`}
            tooltipProps={{
              text:
                i +
                1 +
                '. ' +
                unit.lessons[lessonIndex].activitySections[
                  level.activitySectionIndex
                ].title,
              size: 'm',
              direction: 'onBottom',
              className: moduleStyles.tooltip,
            }}
          >
            <Button
              className={classNames(
                i === levelIndex ? moduleStyles.currentLevel : undefined,
                moduleStyles.progressBubble,
              )}
              type="secondary"
              color="gray"
              useAsLink
              size="s"
              alt={'level ' + (i + 1)}
              isIconOnly={i !== levelIndex}
              icon={i === levelIndex ? undefined : {}}
              text={i === levelIndex ? i + 1 : undefined}
              href={`/units/${unitKey}/lessons/${lessonIndex + 1}/levels/${i + 1}`}
            />
          </WithTooltip>
        ))}
        {levelIndex === unit.lessons[lessonIndex].levels.length - 1 && (
          <Button
            className={moduleStyles.progressButton}
            alt="Skip to next level"
            size="xs"
            color="gray"
            useAsLink
            type="secondary"
            icon={{
              iconName: 'right',
              iconStyle: 'solid',
            }}
            isIconOnly
            disabled
            href={`/units/${unitKey}/lessons/${lessonIndex + 1}/levels/${levelIndex + 2}`}
          />
        )}
        {levelIndex !== unit.lessons[lessonIndex].levels.length - 1 && (
          <WithTooltip
            tooltipProps={{
              text:
                levelIndex +
                  2 +
                  '. ' +
                  unit.lessons[lessonIndex].activitySections[
                    unit.lessons[lessonIndex].levels[levelIndex + 1]
                      ?.activitySectionIndex
                  ]?.title || '',
              size: 'm',
              direction: 'onBottom',
              className: moduleStyles.tooltip,
            }}
          >
            <Button
              className={moduleStyles.progressButton}
              alt="Skip to next level"
              size="xs"
              color="gray"
              useAsLink
              type="secondary"
              icon={{
                iconName: 'right',
                iconStyle: 'solid',
              }}
              isIconOnly
              disabled={levelIndex === unit.lessons[lessonIndex].levels.length}
              href={`/units/${unitKey}/lessons/${lessonIndex + 1}/levels/${levelIndex + 2}`}
            />
          </WithTooltip>
        )}
      </div>
      <Button
        alt="Open unit overview"
        className={moduleStyles.button}
        size="s"
        color="white"
        type="secondary"
        icon={{
          iconName: 'list',
          iconStyle: 'solid',
        }}
        isIconOnly
        onClick={() => setOpenOverview(true)}
      />
      {openOverview && (
        <CustomDialog
          title="Unit Overview"
          className={moduleStyles.unitOverview}
          onClose={() => setOpenOverview(false)}
        >
          <Unit unit={unit} />
        </CustomDialog>
      )}
    </nav>
  );
};

export default Progress;
