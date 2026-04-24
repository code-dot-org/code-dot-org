import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Typography} from '@mui/material';
import React, {useCallback, useEffect} from 'react';
import {Tour} from 'shepherd.js';

import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {TriggerSource} from '@cdo/apps/lab2/productTours/constants';
import {ProductTourConfig} from '@cdo/apps/lab2/productTours/productToursPerLab';
import {LifecycleEvent, sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {createTourWithSteps} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';

import styles from './guided-walkthroughs.module.scss';

import '@cdo/apps/sharedComponents/productTour/shepherd.scss';

interface GuidedWalkthroughsProps {
  levelTours: ProductTourConfig[];
  otherAvailableTours: ProductTourConfig[];
}

const GuidedWalkthroughs: React.FC<GuidedWalkthroughsProps> = ({
  levelTours,
  otherAvailableTours,
}) => {
  const [isTourRunning, setIsTourRunning] = React.useState(false);
  const activeTourRef = React.useRef<Tour | null>(null);

  const endActiveTour = useCallback((manuallyCancel: boolean) => {
    if (activeTourRef.current) {
      if (manuallyCancel) {
        activeTourRef.current.cancel();
      }
      activeTourRef.current = null;
    }
    setIsTourRunning(false);
  }, []);

  // Cancel active tour on unmount.
  useEffect(() => {
    return () => {
      endActiveTour(true);
    };
  }, [endActiveTour]);

  // Cancel active tour on level load start.
  useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, () => {
    endActiveTour(true);
  });

  const startTour = (tourName: string, type: 'level' | 'other') => {
    if (isTourRunning) return;
    const tourConfig = (
      type === 'level' ? levelTours : otherAvailableTours
    ).find(tour => tour.name === tourName);
    if (tourConfig) {
      setIsTourRunning(true);
      const tour = createTourWithSteps(tourConfig.getSteps);
      activeTourRef.current = tour;
      tour.on('start', () =>
        sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_STARTED, {
          flowName: tourConfig.metricName,
          triggerSource: TriggerSource.StudentResourcesTab,
        })
      );
      tour.on('complete', () => {
        endActiveTour(false);

        sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_COMPLETED, {
          flowName: tourConfig.metricName,
          triggerSource: TriggerSource.StudentResourcesTab,
        });
      });
      tour.on('cancel', () => {
        endActiveTour(false);
        const currentIndex = tour.currentStep
          ? tour.steps.indexOf(tour.currentStep)
          : 0;
        sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_EXIT, {
          flowName: tourConfig.metricName,
          step: currentIndex.toString(),
          triggerSource: TriggerSource.StudentResourcesTab,
        });
      });
      tour.start();
    }
  };

  const renderTourChip = (tour: ProductTourConfig, type: 'level' | 'other') => (
    <div key={tour.name} className={styles.tourChip}>
      <Typography variant="body3">{tour.displayName}</Typography>
      <IconButton
        size="extraSmall"
        onClick={() => startTour(tour.name, type)}
        aria-label={`Play ${tour.displayName}`}
        variant="outlined"
        color="tertiary"
      >
        <FontAwesomeV6Icon iconName="play" />
      </IconButton>
    </div>
  );

  return (
    <div>
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

export default GuidedWalkthroughs;
