// The student's progress so far, under an encouraging heading: the map's
// totals and the destinations, laid out as a card.

import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useEffect, useRef} from 'react';

import {totalTimeSpent} from '../../progress';
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
          <div className={styles.statsItem}>
            <MuiTypography variant="overline2" component="dt">
              Checkpoints completed
            </MuiTypography>
            <MuiTypography variant="h2" component="dd">
              {completedCount(statusMap)}
            </MuiTypography>
          </div>
          {skills.length > 0 && (
            <div className={styles.statsItem}>
              <MuiTypography variant="overline2" component="dt">
                Skills
              </MuiTypography>
              <dd className={styles.statsRings}>
                <ProgressRings rings={skills} />
              </dd>
            </div>
          )}
          {destinations.length > 0 && (
            <div className={styles.statsItem}>
              <MuiTypography variant="overline2" component="dt">
                Destinations
              </MuiTypography>
              <dd className={styles.statsRings}>
                <ProgressRings rings={destinations} />
              </dd>
            </div>
          )}
          <div className={styles.statsItem}>
            <MuiTypography variant="overline2" component="dt">
              Time spent
            </MuiTypography>
            <MuiTypography variant="h2" component="dd">
              {formatTimeSpent(totalTimeSpent(progress))}
            </MuiTypography>
          </div>
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
