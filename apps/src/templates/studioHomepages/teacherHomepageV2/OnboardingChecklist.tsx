import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, Button as MuiButton} from '@mui/material';
import React from 'react';

import styles from './teacherHomepage.module.scss';

const CHECKLIST_ITEMS = [
  {label: 'Review the syllabus', completed: false},
  {label: 'Learn how to evaluate', completed: false},
  {label: 'Create a class section', completed: true},
];

const OnboardingChecklist: React.FC = () => {
  const [isHidden, setIsHidden] = React.useState(false);

  const handleButtonClick = () => {
    console.log('Tour started');
  };

  if (isHidden) {
    return null;
  }

  return (
    <div className={styles.onboardingChecklistOuter}>
      <div className={styles.onboardingChecklistInner}>
        <Typography variant="h4" gutterBottom>
          ✦ Where should we start?
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
              onClick={handleButtonClick}
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
