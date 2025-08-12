'use client';

import classNames from 'classnames';
import React, {useState} from 'react';

import Button, {LinkButton} from '@code-dot-org/component-library/button';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import Link from '@code-dot-org/component-library/link';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {Heading6} from '@code-dot-org/component-library/typography';

import type {Unit as UnitData} from '@/app/models/unit';
import Unit from '@/components/unit';

import moduleStyles from './progress.module.scss';

export interface ProgressProps {
  unit: UnitData;
  lessonIndex: number;
  levelIndex: number;
  onNavigate?: (levelIndex: number) => void;
}

const Progress: React.FunctionComponent<ProgressProps> = ({
  unit,
  lessonIndex,
  levelIndex,
  onNavigate,
}) => {
  const [openOverview, setOpenOverview] = useState<boolean>(false);

  return (
    <nav className={moduleStyles.progress}>
      <Heading6 className={moduleStyles.progressHeader}>
        <Link href={`/units/${unit.key}`}>
          Lesson {lessonIndex + 1}: {unit.lessons[lessonIndex].title}
        </Link>
      </Heading6>
      <div className={moduleStyles.progressContainer}>
        {levelIndex === 0 && (
          <Button
            className={moduleStyles.progressButton}
            title="Go back to previous level"
            size="xs"
            color="gray"
            onClick={() => {}}
            type="secondary"
            icon={{
              iconName: 'arrow-left',
              iconStyle: 'solid',
            }}
            isIconOnly
            disabled
          />
        )}
        {levelIndex !== 0 && (
          <WithTooltip
            tooltipProps={{
              tooltipId: 'progress-tooltip-previous-level',
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
            {onNavigate ? (
              <Button
                className={moduleStyles.progressButton}
                title="Go back to previous level"
                size="xs"
                color="gray"
                onClick={() => {
                  onNavigate(levelIndex - 1);
                }}
                type="secondary"
                icon={{
                  iconName: 'arrow-left',
                  iconStyle: 'solid',
                }}
                isIconOnly
              />
            ) : (
              <LinkButton
                className={moduleStyles.progressButton}
                title="Go back to previous level"
                size="xs"
                useAsLink
                color="gray"
                type="secondary"
                icon={{
                  iconName: 'left',
                  iconStyle: 'solid',
                }}
                isIconOnly
                href={`/units/${unit.key}/lessons/${lessonIndex + 1}/levels/${levelIndex}`}
              />
            )}
          </WithTooltip>
        )}
        {unit.lessons[lessonIndex].levels.map((level, i) => (
          <WithTooltip
            key={`progress-lesson-${lessonIndex}-level-${i}`}
            tooltipProps={{
              tooltipId: `progress-tooltip-goto-level-${i}`,
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
            {onNavigate ? (
              <Button
                className={classNames(
                  i === levelIndex ? moduleStyles.currentLevel : undefined,
                  moduleStyles.progressBubble,
                  level.data?.isConcept ? moduleStyles.diamond : undefined,
                )}
                type="secondary"
                color="gray"
                onClick={() => {
                  onNavigate(i);
                }}
                size="s"
                title={'level ' + (i + 1).toString()}
                isIconOnly={i !== levelIndex}
                icon={
                  i !== levelIndex
                    ? {
                        iconName: '',
                      }
                    : undefined
                }
                text={i === levelIndex ? (i + 1).toString() : ''}
              />
            ) : (
              <LinkButton
                className={classNames(
                  i === levelIndex ? moduleStyles.currentLevel : undefined,
                  moduleStyles.progressBubble,
                  level.data?.isConcept ? moduleStyles.diamond : undefined,
                )}
                type="secondary"
                color="gray"
                size="s"
                title={'level ' + (i + 1).toString()}
                text={i === levelIndex ? (i + 1).toString() : ''}
                href={`/units/${unit.key}/lessons/${lessonIndex + 1}/levels/${i + 1}`}
              />
            )}
          </WithTooltip>
        ))}
        {levelIndex === unit.lessons[lessonIndex].levels.length - 1 && (
          <Button
            className={moduleStyles.progressButton}
            title="Skip to next level"
            size="xs"
            color="gray"
            onClick={() => {}}
            type="secondary"
            icon={{
              iconName: 'arrow-right',
              iconStyle: 'solid',
            }}
            isIconOnly
            disabled
          />
        )}
        {levelIndex !== unit.lessons[lessonIndex].levels.length - 1 && (
          <WithTooltip
            tooltipProps={{
              tooltipId: 'progress-tooltip-next-level',
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
            {onNavigate ? (
              <Button
                className={moduleStyles.progressButton}
                title="Skip to next level"
                size="xs"
                color="gray"
                onClick={() => {
                  onNavigate(levelIndex + 1);
                }}
                type="secondary"
                icon={{
                  iconName: 'arrow-right',
                  iconStyle: 'solid',
                }}
                isIconOnly
              />
            ) : (
              <LinkButton
                className={moduleStyles.progressButton}
                title="Skip to next level"
                size="xs"
                color="gray"
                type="secondary"
                icon={{
                  iconName: 'right',
                  iconStyle: 'solid',
                }}
                isIconOnly
                href={`/units/${unit.key}/lessons/${lessonIndex + 1}/levels/${levelIndex + 2}`}
              />
            )}
          </WithTooltip>
        )}
      </div>
      <Button
        title="Open unit overview"
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
