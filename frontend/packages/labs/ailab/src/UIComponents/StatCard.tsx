/* A labeled statistic about a column, such as its type or range. */
import {Typography} from '@mui/material';

import styles from './statCard.module.scss';

export interface StatCardProps {
  label: string;
  value: string;
}

const StatCard = ({label, value}: StatCardProps) => (
  <div className={styles.statCard}>
    <Typography variant="body4" className={styles.statLabel}>
      {label}
    </Typography>
    <div className={styles.statValue} title={value}>
      {value}
    </div>
  </div>
);

export default StatCard;
