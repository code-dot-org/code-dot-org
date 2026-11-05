// The map's running totals: a ring per skill, and the time spent so far.
// The time is a button that does nothing but take focus, like the rings, so
// a keyboard reaches its tooltip and a screen reader reads its label.

import {Tooltip, Typography as MuiTypography} from '@mui/material';
import React from 'react';

import {formatTimeSpent} from './formatTimeSpent';
import {GroupProgress} from './map/groupProgress';
import ProgressRings from './ProgressRings';

import styles from './mapStats.module.scss';

interface MapStatsProps {
  skills: GroupProgress[];
  timeSpentSeconds: number;
}

const MapStats: React.FunctionComponent<MapStatsProps> = ({
  skills,
  timeSpentSeconds,
}) => (
  <div className={styles.stats}>
    {skills.length > 0 && <ProgressRings rings={skills} />}
    <Tooltip title="Time Spent" arrow>
      <MuiTypography
        variant="strong"
        component="button"
        type="button"
        className={styles.time}
        aria-label={`Time spent: ${formatTimeSpent(timeSpentSeconds)}`}
      >
        {formatTimeSpent(timeSpentSeconds)}
      </MuiTypography>
    </Tooltip>
  </div>
);

export default MapStats;
