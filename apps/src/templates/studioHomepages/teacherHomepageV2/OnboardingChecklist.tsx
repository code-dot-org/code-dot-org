import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, Button as MuiButton} from '@mui/material';
import React from 'react';
import {Tour} from 'shepherd.js';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {Section} from '../../teacherDashboard/types/teacherSectionTypes';

import confirmDemoSectionSettings from './confirmDemoSectionSettings';
import DemoSectionStalenessDialog from './DemoSectionStalenessDialog';
import useCreateSectionTour from './useCreateSectionTour';
import useLearnHowToEvaluateTour from './useLearnHowToEvaluateTour';
import useReviewSyllabusTour from './useReviewSyllabusTour';

import styles from './teacherHomepage.module.scss';

const CHECKLIST_ITEMS = [
  {id: 'review-syllabus', label: 'Review the syllabus', completed: false},
  {id: 'learn-to-evaluate', label: 'Learn how to evaluate', completed: false},
  {id: 'create-section', label: 'Create a class section', completed: true},
];

interface OnboardingChecklistProps {
  demoSection: Section | null;
}

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  demoSection,
}) => {
  const gradesTeaching = useAppSelector(
    state => state.currentUser.gradesTeaching
  );
  const createSectionTour = useCreateSectionTour(gradesTeaching);
  const reviewSyllabusTour = useReviewSyllabusTour(demoSection);
  const learnHowToEvaluateTour = useLearnHowToEvaluateTour(demoSection);

  const [isHidden, setIsHidden] = React.useState(false);
  const [pendingTour, setPendingTour] = React.useState<Tour | null>(null);
  const [isDemoSectionStale, setIsDemoSectionStale] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    confirmDemoSectionSettings(demoSection).then(stale => {
      if (active) {
        setIsDemoSectionStale(stale);
      }
    });
    return () => {
      active = false;
    };
  }, [demoSection]);

  const startTourOrBlock = (tour: Tour | null) => {
    if (isDemoSectionStale) {
      setPendingTour(tour);
    } else {
      tour?.start();
    }
  };

  const handleButtonClick = (id: string) => {
    if (id === 'create-section') {
      createSectionTour?.start();
    } else if (id === 'review-syllabus') {
      startTourOrBlock(reviewSyllabusTour);
    } else if (id === 'learn-to-evaluate') {
      startTourOrBlock(learnHowToEvaluateTour);
    }
  };

  const handleStalenessCancel = () => {
    pendingTour?.cancel();
    setPendingTour(null);
  };

  const handleStalenessReset = () => {
    // TODO: reset the demo section's course assignment. For now we just
    // continue with the tour the teacher was trying to start.
    const tour = pendingTour;
    setPendingTour(null);
    tour?.start();
  };

  if (isHidden) {
    return null;
  }

  return (
    <>
      {pendingTour && (
        <DemoSectionStalenessDialog
          onCancel={handleStalenessCancel}
          onReset={handleStalenessReset}
        />
      )}
      <div className={styles.onboardingChecklistOuter}>
        <div className={styles.onboardingChecklistInner}>
          <div className={styles.onboardingChecklistInnerContent}>
            <Typography variant="h4" gutterBottom>
              <span className={styles.gradientIcon}>
                <FontAwesomeV6Icon iconName="sparkle" iconStyle="solid" />
              </span>
              Where should we start?
            </Typography>
            <Typography variant="body2">
              Teaching Assistant can help you get started with CodeAI
            </Typography>
            <div className={styles.onboardingChecklistButtons}>
              {CHECKLIST_ITEMS.map(({id, label, completed}) => (
                <MuiButton
                  key={id}
                  variant="outlined"
                  color="secondary"
                  className={styles.onboardingChecklistButton}
                  onClick={() => handleButtonClick(id)}
                  type="button"
                >
                  {completed && (
                    <span className={styles.onboardingChecklistCheckIcon}>
                      <FontAwesomeV6Icon
                        iconName="circle-check"
                        iconStyle="solid"
                      />
                    </span>
                  )}
                  {label}
                </MuiButton>
              ))}
            </div>
          </div>
        </div>
        <MuiButton
          type="button"
          onClick={() => setIsHidden(true)}
          color="tertiary"
        >
          Hide onboarding
        </MuiButton>
      </div>
    </>
  );
};

export default OnboardingChecklist;
