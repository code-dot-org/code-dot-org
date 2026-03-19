import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Typography} from '@mui/material';
import React from 'react';

import {ToursPerLab} from '@cdo/apps/lab2/productTours/productToursPerLab';
import {AppName} from '@cdo/apps/lab2/types';

import styles from './student-resources-panel.module.scss';

interface StudentResourcesPanelProps {
  appName: string;
}

const StudentResourcesPanel: React.FC<StudentResourcesPanelProps> = ({
  appName,
}) => {
  const tours = ToursPerLab[appName as AppName] ?? [];

  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <Typography variant="body3" className={styles.sectionHeading}>
          <FontAwesomeV6Icon iconName="route" />
          <strong>Guided walkthroughs</strong>
        </Typography>
        <Typography variant="body4" className={styles.sectionDescription}>
          Short, interactive tours that teach you how to use important features
          in this lab. You won&apos;t lose your progress.
        </Typography>
        {tours.map(tour => (
          <div key={tour.name} className={styles.tourChip}>
            <Typography variant="body3" className={styles.tourName}>
              {tour.displayName}
            </Typography>
            <IconButton
              size="extraSmall"
              onClick={() => console.log(`Playing tour: ${tour.name}`)}
              aria-label={`Play ${tour.displayName}`}
              className={styles.tourPlayButton}
            >
              <FontAwesomeV6Icon iconName="play" />
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentResourcesPanel;
