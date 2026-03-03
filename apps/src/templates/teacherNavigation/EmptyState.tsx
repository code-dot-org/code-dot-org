import {Typography} from '@mui/material';
import React from 'react';

import styles from './teacher-navigation.module.scss';

export interface EmptyStateProps {
  headline: string;
  descriptionText: string | null;
  imageComponent: JSX.Element;
  button: JSX.Element | null;
}
export const EmptyState: React.FC<EmptyStateProps> = ({
  imageComponent,
  headline,
  descriptionText,
  button,
}) => {
  return (
    <div className={styles.emptyClassroomDiv}>
      <div className={styles.emptyClassroomImage}>{imageComponent}</div>
      <Typography className={styles.topPadding} variant="h3" gutterBottom>
        {headline}
      </Typography>
      <Typography variant="body2" gutterBottom>
        {descriptionText}
      </Typography>
      {button}
    </div>
  );
};
