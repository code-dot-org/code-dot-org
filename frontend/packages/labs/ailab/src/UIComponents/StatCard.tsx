/* A labeled statistic about a column, such as its type or range. */
import styles from './statCard.module.scss';

export interface StatCardProps {
  label: string;
  value: string;
}

const StatCard = ({label, value}: StatCardProps) => (
  <div className={styles.statCard}>
    <div className={styles.statLabel}>{label}</div>
    <div className={styles.statValue} title={value}>
      {value}
    </div>
  </div>
);

export default StatCard;
