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
  levelTours: ProductTourConfig[];
  otherAvailableTours: ProductTourConfig[];
}

const StudentResourcesPanel: React.FC<StudentResourcesPanelProps> = ({
  levelTours,
  otherAvailableTours,
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

  const startTour = (tourName: string, type: 'level' | 'other') => {
    if (isTourRunning) return;
    setIsTourRunning(true);
    const tourConfig = (
      type === 'level' ? levelTours : otherAvailableTours
    ).find(tour => tour.name === tourName);
    if (tourConfig) {
      const tour = createTourWithSteps(tourConfig.getSteps);
      activeTourRef.current = tour;
      tour.start();
      tour.on('complete', () => endActiveTour());
      tour.on('cancel', () => endActiveTour());
    }
  };

  const renderTourChip = (tour: ProductTourConfig, type: 'level' | 'other') => (
    <div key={tour.name} className={styles.tourChip}>
      <Typography variant="body3">{tour.displayName}</Typography>
      <IconButton
        size="extraSmall"
        onClick={() => startTour(tour.name, type)}
        aria-label={`Play ${tour.displayName}`}
        className={styles.tourPlayButton}
      >
        <FontAwesomeV6Icon iconName="play" />
      </IconButton>
    </div>
  );

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
        {levelTours.length > 0 && (
          <Typography variant="overline3" className={styles.subSectionHeading}>
            For This Level
          </Typography>
        )}
        {levelTours.map(tour => renderTourChip(tour, 'level'))}
        {otherAvailableTours.length > 0 && (
          <Typography variant="overline3" className={styles.subSectionHeading}>
            All Walkthroughs
          </Typography>
        )}
        {otherAvailableTours.map(tour => renderTourChip(tour, 'other'))}
      </div>
    </div>
  );
};

export default StudentResourcesPanel;
