import {Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {CheckpointStatusMap} from '../progress';
import {AiMetrics} from '../progress/progressStore';
import {STAT_KINDS} from '../schema/steps/stats';
import {Pathway, StatsStep} from '../types';

import {
  completedCount,
  getDestinationProgress,
  getSkillProgress,
} from './map/groupProgress';
import ProgressRings from './ProgressRings';

import styles from './statsList.module.scss';

interface StatsListProps {
  pathway: Pathway;
  statusMap: CheckpointStatusMap;
  aiMetrics?: AiMetrics;
  stats?: StatsStep['stats'];
  /** One tile to a row, for a narrow column. */
  narrow?: boolean;
}

const StatsList: React.FunctionComponent<StatsListProps> = ({
  pathway,
  statusMap,
  aiMetrics,
  stats,
  narrow = false,
}) => {
  const destinations = getDestinationProgress(pathway, statusMap);
  const skills = getSkillProgress(pathway, statusMap);

  // A figure with nothing behind it is left out rather than shown empty.
  const items: {[kind in (typeof STAT_KINDS)[number]]: React.ReactNode} = {
    checkpoints: (
      <MuiTypography variant="h2" component="dd" className={styles.statsFigure}>
        {completedCount(statusMap)}
      </MuiTypography>
    ),
    aiChangesAccepted: aiMetrics && (
      <MuiTypography variant="h2" component="dd" className={styles.statsFigure}>
        {aiMetrics.accepted}
      </MuiTypography>
    ),
    aiChangesRejected: aiMetrics && (
      <MuiTypography variant="h2" component="dd" className={styles.statsFigure}>
        {aiMetrics.rejected}
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
    aiChangesAccepted: 'AI changes accepted',
    aiChangesRejected: 'AI changes rejected',
    skills: 'Skill mastery',
    destinations: 'Focus areas',
  };

  return (
    <dl className={classNames(styles.statsList, narrow && styles.narrow)}>
      {(stats ?? STAT_KINDS).map(
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
  );
};

export default StatsList;
