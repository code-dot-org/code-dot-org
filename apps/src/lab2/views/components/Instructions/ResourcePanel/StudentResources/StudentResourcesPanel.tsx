import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Typography} from '@mui/material';
import React from 'react';
import {Tour} from 'shepherd.js';

import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {ProductTourConfig} from '@cdo/apps/lab2/productTours/productToursPerLab';
import {LifecycleEvent} from '@cdo/apps/lab2/utils';
import {createTourWithSteps} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';

import styles from './student-resources-panel.module.scss';

import '@cdo/apps/sharedComponents/productTour/shepherd.scss';

interface StudentResourcesPanelProps {
  availableTours: ProductTourConfig[];
}

const StudentResourcesPanel: React.FC<StudentResourcesPanelProps> = ({
  availableTours,
}) => {
  const [isTourRunning, setIsTourRunning] = React.useState(false);
  const activeTourRef = React.useRef<Tour | null>(null);

  useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, () => {
    endActiveTour();
  });

  const endActiveTour = () => {
    if (activeTourRef.current) {
      activeTourRef.current.hide();
      activeTourRef.current = null;
    }
    setIsTourRunning(false);
  };

  const startTour = (tourName: string) => {
    if (isTourRunning) return;
    setIsTourRunning(true);
    const tourConfig = availableTours.find(tour => tour.name === tourName);
    if (tourConfig) {
      const tour = createTourWithSteps(tourConfig.getSteps);
      activeTourRef.current = tour;
      tour.start();
      tour.on('complete', () => endActiveTour());
      tour.on('cancel', () => endActiveTour());
    }
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
      <div className={styles.tourList}>
        {availableTours.map(tour => (
          <div key={tour.name} className={styles.tourChip}>
            <Typography variant="body3">{tour.displayName}</Typography>
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
    </div>
  );
};

export default StudentResourcesPanel;
