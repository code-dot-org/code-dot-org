import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Typography} from '@mui/material';
import React from 'react';

import {ToursPerLab} from '@cdo/apps/lab2/productTours/productToursPerLab';
import {AppName} from '@cdo/apps/lab2/types';

import styles from './student-resources-panel.module.scss';
import '@cdo/apps/sharedComponents/productTour/shepherd.scss';

interface StudentResourcesPanelProps {
  appName: string;
}

const StudentResourcesPanel: React.FC<StudentResourcesPanelProps> = ({
  appName,
}) => {
  const [isTourRunning, setIsTourRunning] = React.useState(false);
  const tours = ToursPerLab[appName as AppName] ?? [];

  const startTour = (tourName: string) => {
    if (isTourRunning) return;
  };

  return (
    <div className={styles.panel}>
      <Typography variant="body3" className={styles.sectionHeading}>
        <FontAwesomeV6Icon iconName="route" />
        <strong>Guided walkthroughs</strong>
      </Typography>
      <Typography variant="body4" className={styles.sectionDescription}>
        Short, interactive tours that teach you how to use important features in
        this lab. You won&apos;t lose your progress.
      </Typography>
      {tours.map(tour => (
        <div key={tour.name} className={styles.tourChip}>
          <Typography variant="body3" className={styles.tourName}>
            {tour.displayName}
          </Typography>
          <IconButton
            size="extraSmall"
            onClick={() => startTour(tour.name)}
            aria-label={`Play ${tour.displayName}`}
            className={styles.tourPlayButton}
          >
            <FontAwesomeV6Icon iconName="play" />
          </IconButton>
        </div>
      ))}
    </div>
  );
};

export default StudentResourcesPanel;
