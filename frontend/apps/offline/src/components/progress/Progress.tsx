'use client';

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
        {unit.lessons[lessonIndex].levels.map((level, i) => (
          <WithTooltip
            key={`progress-lesson-${lessonIndex}-level-${i}`}
            tooltipProps={{
              text: unit.lessons[lessonIndex].activitySections[
                level.activitySectionIndex
              ].title,
              size: 'm',
              direction: 'onBottom',
              className: moduleStyles.tooltip,
            }}
          >
            <Button
              className={
                i === levelIndex ? moduleStyles.currentLevel : undefined
              }
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
      </div>
      <Button
        alt="Open unit overview"
        className={moduleStyles.unitOverviewButton}
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
