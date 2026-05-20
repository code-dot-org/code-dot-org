import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, Button as MuiButton} from '@mui/material';
import React from 'react';
import {Tour} from 'shepherd.js';

import {DemoType} from '../../teacherDashboard/types/teacherSectionTypes';

import styles from './teacherHomepage.module.scss';

const CHECKLIST_ITEMS = [
  {id: 'review-syllabus', label: 'Review the syllabus', completed: false},
  {id: 'learn-to-evaluate', label: 'Learn how to evaluate', completed: false},
  {id: 'create-section', label: 'Create a class section', completed: true},
];

interface OnboardingChecklistProps {
  createSectionTour: Tour | null;
  reviewSyllabusTour: Tour | null;
  demoType: DemoType;
}

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  createSectionTour,
  reviewSyllabusTour,
  demoType,
}) => {
  const [isHidden, setIsHidden] = React.useState(false);

  const handleButtonClick = (id: string) => {
    if (id === 'create-section') {
      createSectionTour?.start();
    } else if (id === 'review-syllabus') {
      reviewSyllabusTour?.start();
    }
  };

  if (isHidden) {
    return null;
  }

  return (
    <div className={styles.onboardingChecklistOuter}>
      <div className={styles.onboardingChecklistInner}>
        <Typography variant="h4" gutterBottom>
          <span className={styles.gradientIcon}>
            <FontAwesomeV6Icon iconName="sparkle" iconStyle="solid" />
          </span>
          Where should we start?
        </Typography>
        <Typography variant="body2">
          Teaching Assistant can help you get started with Code.org
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
