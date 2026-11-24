// The student's progress so far, under an encouraging heading: the map's
// totals, the tutor's changes they accepted and rejected, and the skills and
// destinations, each in a tile with its label beneath, in the step's order.
// A logo from the content sits above the heading when set.

import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import {AiMetrics, serverProgressStore} from '../../progress/progressStore';
import {StatsStep as StatsStepContent} from '../../types';
import {usePathwayContext} from '../PathwayContext';
import StatsList from '../StatsList';

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
  const {pathway, progressKey, statusMap, viewAsUserId} = usePathwayContext();
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  const [aiMetrics, setAiMetrics] = useState<AiMetrics>();
  useEffect(() => {
    let cancelled = false;
    serverProgressStore
      .loadAiMetrics(progressKey, viewAsUserId ?? undefined)
      .then(counts => {
        if (!cancelled) setAiMetrics(counts);
      });
    return () => {
      cancelled = true;
    };
  }, [progressKey, viewAsUserId]);

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
        <StatsList
          pathway={pathway}
          statusMap={statusMap}
          aiMetrics={aiMetrics}
          stats={step.stats}
        />
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
