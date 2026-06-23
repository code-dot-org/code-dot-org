import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, Button as MuiButton} from '@mui/material';
import React from 'react';
import {Tour} from 'shepherd.js';

import HttpClient from '@cdo/apps/util/HttpClient';

import {DemoType} from '../../teacherDashboard/types/teacherSectionTypes';

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
  createSectionTour: Tour | null;
  reviewSyllabusTour: Tour | null;
  learnHowToEvaluateTour: Tour | null;
  demoType: DemoType;
  isHidden: boolean;
  onHide: () => void;
}

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  createSectionTour,
  reviewSyllabusTour,
  learnHowToEvaluateTour,
  demoType,
  isHidden,
  onHide,
}) => {
  const [completedTourNames, setCompletedTourNames] = React.useState<
    Set<string>
  >(new Set());

  React.useEffect(() => {
    HttpClient.get('/dashboardapi/v1/user_product_tours', true)
      .then(response => response.json() as Promise<string[]>)
      .then(names => setCompletedTourNames(new Set(names)))
      .catch(err =>
        console.error('Failed to fetch tour completion status:', err)
      );
  }, []);

  const handleButtonClick = (tourName: string) => {
    recordTourStart(tourName, demoType);
    if (tourName === 'create_class_section') {
      createSectionTour?.start();
    } else if (tourName === 'view_syllabus') {
      reviewSyllabusTour?.start();
    } else if (tourName === 'learn_to_evaluate') {
      learnHowToEvaluateTour?.start();
    }
  };

  if (isHidden) {
    return null;
  }

  return (
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
  );
};

export default OnboardingChecklist;
