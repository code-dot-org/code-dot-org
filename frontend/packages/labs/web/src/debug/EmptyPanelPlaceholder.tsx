import {Typography} from '@mui/material';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import styles from './emptyPanelPlaceholder.module.css';

// The "nothing here yet" state for a debug panel pane. Ported from
// apps/src/weblab2/debugPanel/EmptyPanelPlaceholder.tsx.

export interface EmptyPanelPlaceholderProps {
  iconName: string;
  title: string;
  description: string;
}

export const EmptyPanelPlaceholder = ({
  iconName,
  title,
  description,
}: EmptyPanelPlaceholderProps) => (
  <div className={styles.container}>
    <div className={styles.innerContainer}>
      <div className={styles.iconCircle}>
        <FontAwesomeV6Icon iconName={iconName} />
      </div>
      <Typography className={styles.title} variant="body2">
        <Typography variant="strong">{title}</Typography>
      </Typography>
      <Typography className={styles.description} variant="body4">
        {description}
      </Typography>
    </div>
  </div>
);
