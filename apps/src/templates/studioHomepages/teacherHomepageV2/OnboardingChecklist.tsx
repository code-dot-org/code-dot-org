import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, Button as MuiButton} from '@mui/material';
import React from 'react';
import {Tour} from 'shepherd.js';

import styles from './teacherHomepage.module.scss';

const CHECKLIST_ITEMS = [
  {label: 'Review the syllabus', completed: false},
  {label: 'Learn how to evaluate', completed: false},
  {label: 'Create a class section', completed: true},
];

interface OnboardingChecklistProps {
  onboardingTour: Tour | null;
}

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  onboardingTour,
}) => {
  const [isHidden, setIsHidden] = React.useState(false);

  const handleButtonClick = (label: string) => {
    if (label === 'Create a class section') {
      onboardingTour?.start();
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
          {CHECKLIST_ITEMS.map(({label, completed}) => (
            <MuiButton
              key={label}
              variant="outlined"
              color="secondary"
              className={styles.onboardingChecklistButton}
              onClick={() => handleButtonClick(label)}
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
