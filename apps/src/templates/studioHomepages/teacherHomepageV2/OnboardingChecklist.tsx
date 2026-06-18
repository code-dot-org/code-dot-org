import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, Button as MuiButton} from '@mui/material';
import React from 'react';
import {Tour} from 'shepherd.js';

import HttpClient from '@cdo/apps/util/HttpClient';

import {DemoType} from '../../teacherDashboard/types/teacherSectionTypes';

import styles from './teacherHomepage.module.scss';

const CHECKLIST_ITEMS = [
  {id: 'review-syllabus', label: 'Review the syllabus', completed: false},
  {id: 'learn-to-evaluate', label: 'Learn how to evaluate', completed: false},
  {id: 'create-section', label: 'Create a class section', completed: true},
];

const TOUR_NAMES: Record<string, string> = {
  'create-section': 'create_class_section',
  'review-syllabus': 'view_syllabus',
  'learn-to-evaluate': 'learn_to_evaluate',
};

const recordTourStart = (id: string, demoType: DemoType) => {
  const tourName = TOUR_NAMES[id];
  if (!tourName) return;
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
}

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  createSectionTour,
  reviewSyllabusTour,
  learnHowToEvaluateTour,
  demoType,
}) => {
  const [isHidden, setIsHidden] = React.useState(false);

  const handleButtonClick = (id: string) => {
    recordTourStart(id, demoType);
    if (id === 'create-section') {
      createSectionTour?.start();
    } else if (id === 'review-syllabus') {
      reviewSyllabusTour?.start();
    } else if (id === 'learn-to-evaluate') {
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
  );
};

export default OnboardingChecklist;
