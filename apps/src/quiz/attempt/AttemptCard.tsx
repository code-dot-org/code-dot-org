import {Typography} from '@mui/material';
import React from 'react';

import styles from './attempt-card.module.scss';

export interface AttemptCardProps {
  label?: string;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

// Shared card shell for the intro screen and every question type.
const AttemptCard: React.FunctionComponent<AttemptCardProps> = ({
  label,
  title,
  description,
  children,
  footer,
}) => (
  <div className={styles.card}>
    <div className={styles.content}>
      <div className={styles.headerRow}>
        <div className={styles.header}>
          {label && (
            <Typography variant="overline2" className={styles.label}>
              {label}
            </Typography>
          )}
          {/* Lets a page-change handler focus this heading programmatically. */}
          <Typography variant="h4" component="h2" tabIndex={-1}>
            {title}
          </Typography>
        </div>
        {description}
      </div>
      {children && <div className={styles.body}>{children}</div>}
    </div>
    {footer && <div className={styles.actionRow}>{footer}</div>}
  </div>
);

export default AttemptCard;
