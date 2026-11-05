// The student's progress so far, under an encouraging heading: the map's
// totals and the destinations, laid out as a card, in the step's order.

import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
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
import shared from '../shared.module.scss';

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
      <MuiTypography variant="h2" component="dd">
        {completedCount(statusMap)}
      </MuiTypography>
    ),
    skills: skills.length > 0 && (
      <dd className={styles.statsRings}>
        <ProgressRings rings={skills} />
      </dd>
    ),
    destinations: destinations.length > 0 && (
      <dd className={styles.statsRings}>
        <ProgressRings rings={destinations} />
      </dd>
    ),
    timeSpent: (
      <MuiTypography variant="h2" component="dd">
        {formatTimeSpent(totalTimeSpent(progress))}
      </MuiTypography>
    ),
  };
  const labels = {
    checkpoints: 'Checkpoints completed',
    skills: 'Skills',
    destinations: 'Destinations',
    timeSpent: 'Time spent',
  };

  return (
    <div className={styles.questionsStep}>
      <div className={styles.statsCard}>
        <MuiTypography variant="h1" tabIndex={-1} ref={headingRef}>
          {step.heading}
        </MuiTypography>
        {step.subheading && (
          <MuiTypography variant="body1" className={shared.muted}>
            {step.subheading}
          </MuiTypography>
        )}
        <dl className={styles.statsList}>
          {(step.stats ?? STAT_KINDS).map(
            kind =>
              items[kind] && (
                <div key={kind} className={styles.statsItem}>
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
        <MuiButton variant="contained" color="primary" onClick={onComplete}>
          {continueLabel}
        </MuiButton>
      </div>
    </div>
  );
};

export default StatsStep;
