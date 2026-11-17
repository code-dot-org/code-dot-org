// The student's progress so far, under an encouraging heading: the map's
// totals and the destinations, each in a tile with its label beneath, in the
// step's order. A logo from the content sits above the heading when set.

import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef} from 'react';

import {totalTimeSpent} from '../../progress';
import {STAT_KINDS} from '../../schema/steps/stats';
import {StatsStep as StatsStepContent} from '../../types';
import {formatTimeSpent} from '../formatTimeSpent';
import {
  completedCount,
  getDestinationProgress,
  getSkillProgress,
} from '../map/groupProgress';
import {usePathwayContext} from '../PathwayContext';
import ProgressRings from '../ProgressRings';

import styles from './stepPlayer.module.scss';

interface StatsStepProps {
  step: StatsStepContent;
  continueLabel: string;
  onComplete: () => void;
}

const StatsStep: React.FunctionComponent<StatsStepProps> = ({
  step,
  continueLabel,
  onComplete,
}) => {
  const {pathway, statusMap, progress} = usePathwayContext();
  const destinations = getDestinationProgress(pathway, statusMap);
  const skills = getSkillProgress(pathway, statusMap);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // A figure with nothing behind it is left out rather than shown empty.
  const items: {[kind in (typeof STAT_KINDS)[number]]: React.ReactNode} = {
    checkpoints: (
      <MuiTypography variant="h2" component="dd" className={styles.statsFigure}>
        {completedCount(statusMap)}
      </MuiTypography>
    ),
    timeSpent: (
      <MuiTypography variant="h2" component="dd" className={styles.statsFigure}>
        {formatTimeSpent(totalTimeSpent(progress))}
      </MuiTypography>
    ),
    skills: skills.length > 0 && (
      <dd className={styles.statsRings}>
        <ProgressRings rings={skills} size="large" />
      </dd>
    ),
    destinations: destinations.length > 0 && (
      <dd className={styles.statsRings}>
        <ProgressRings rings={destinations} size="large" />
      </dd>
    ),
  };
  const labels = {
    checkpoints: 'Checkpoints completed',
    timeSpent: 'Time spent',
    skills: 'Skill mastery',
    destinations: 'Focus areas',
  };

  return (
    <div className={styles.questionsStep}>
      <div className={styles.statsCard}>
        {step.logoUrl && (
          <img src={step.logoUrl} alt="" className={styles.statsLogo} />
        )}
        <div className={styles.statsHeader}>
          <MuiTypography
            variant="h3"
            component="h1"
            tabIndex={-1}
            ref={headingRef}
          >
            {step.heading}
          </MuiTypography>
          {step.subheading && (
            <MuiTypography variant="body2">{step.subheading}</MuiTypography>
          )}
        </div>
        <dl className={styles.statsList}>
          {(step.stats ?? STAT_KINDS).map(
            kind =>
              items[kind] && (
                <div
                  key={kind}
                  className={classNames(
                    styles.statsItem,
                    (kind === 'skills' || kind === 'destinations') &&
                      styles.statsItemRings
                  )}
                >
                  <MuiTypography variant="overline2" component="dt">
                    {labels[kind]}
                  </MuiTypography>
                  {items[kind]}
                </div>
              )
          )}
        </dl>
      </div>
      <div className={styles.questionsActions}>
        <MuiButton
          variant="contained"
          color="primary"
          size="large"
          onClick={onComplete}
        >
          {continueLabel}
        </MuiButton>
      </div>
    </div>
  );
};

export default StatsStep;
