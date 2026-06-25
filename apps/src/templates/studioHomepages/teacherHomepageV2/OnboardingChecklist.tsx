import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, Button as MuiButton} from '@mui/material';
import React from 'react';
import {Tour} from 'shepherd.js';

import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  DemoType,
  Section,
} from '../../teacherDashboard/types/teacherSectionTypes';

import confirmDemoSectionSettings from './confirmDemoSectionSettings';
import DemoSectionStalenessDialog from './DemoSectionStalenessDialog';
import useCreateSectionTour from './useCreateSectionTour';
import useLearnHowToEvaluateTour from './useLearnHowToEvaluateTour';
import useReviewSyllabusTour from './useReviewSyllabusTour';

import styles from './teacherHomepage.module.scss';

const CHECKLIST_ITEMS = [
  {id: 'view_syllabus', label: 'Review the syllabus'},
  {id: 'learn_to_evaluate', label: 'Learn how to evaluate'},
  {id: 'create_class_section', label: 'Create a class section'},
];

const recordTourStart = (tourName: string, demoType: DemoType) => {
  HttpClient.post(
    '/dashboardapi/v1/user_product_tours',
    JSON.stringify({
      tour_name: tourName,
      started_at: true,
      properties: {demo_type: demoType},
    }),
    true,
    {'Content-Type': 'application/json'}
  ).catch(err => console.error('Failed to record tour start:', err));
};

interface OnboardingChecklistProps {
  demoSection: Section | null;
  demoType: DemoType;
  isHidden: boolean;
  onHide: () => void;
}

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  demoSection,
  demoType,
  isHidden,
  onHide,
}) => {
  const gradesTeaching = useAppSelector(
    state => state.currentUser.gradesTeaching
  );
  const createSectionTour = useCreateSectionTour(gradesTeaching);
  const reviewSyllabusTour = useReviewSyllabusTour(demoSection);
  const learnHowToEvaluateTour = useLearnHowToEvaluateTour(demoSection);

  const [completedTourNames, setCompletedTourNames] = React.useState<
    Set<string>
  >(new Set());
  const [pendingTour, setPendingTour] = React.useState<Tour | null>(null);
  const [isDemoSectionStale, setIsDemoSectionStale] = React.useState(false);

  React.useEffect(() => {
    HttpClient.get('/dashboardapi/v1/user_product_tours', true)
      .then(response => response.json() as Promise<string[]>)
      .then(names => setCompletedTourNames(new Set(names)))
      .catch(err =>
        console.error('Failed to fetch tour completion status:', err)
      );
  }, []);

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

  const handleButtonClick = (tourName: string) => {
    recordTourStart(tourName, demoType);
    if (tourName === 'create_class_section') {
      createSectionTour?.start();
    } else if (tourName === 'view_syllabus') {
      startTourOrBlock(reviewSyllabusTour);
    } else if (tourName === 'learn_to_evaluate') {
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
              {CHECKLIST_ITEMS.map(({id, label}) => (
                <MuiButton
                  key={id}
                  variant="outlined"
                  color="secondary"
                  className={styles.onboardingChecklistButton}
                  onClick={() => handleButtonClick(id)}
                  type="button"
                >
                  {completedTourNames.has(id) && (
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
        <MuiButton type="button" onClick={onHide} color="tertiary">
          Hide onboarding
        </MuiButton>
      </div>
    </>
  );
};

export default OnboardingChecklist;
