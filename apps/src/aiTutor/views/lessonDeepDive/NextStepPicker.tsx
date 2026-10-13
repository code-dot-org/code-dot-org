import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React, {FC} from 'react';

import styles from './next-step-picker.module.scss';

const NEXT_STEP_OPTIONS = [
  {
    id: 'practice' as const,
    label: 'I want to practice',
    icon: 'dumbbell',
    iconColor: 'var(--text-brand-primary-fixed)',
  },
  {
    id: 'challenge' as const,
    label: 'I want a challenge',
    icon: 'bullseye-arrow',
    iconColor: 'var(--text-error-primary-fixed)',
  },
];

interface NextStepPickerProps {
  onPractice: () => void;
  onChallenge: () => void;
}

const NextStepPicker: FC<NextStepPickerProps> = ({onPractice, onChallenge}) => (
  <div className={styles.container}>
    <div className={styles.prompt}>
      <div className={styles.promptInner}>
        <Typography component="h2" className={styles.heading}>
          Choose your next step
        </Typography>
        <Typography className={styles.subtext}>
          Think about what you just wrote in your reflection. Do you want to
          keep practicing, or do you want a challenge?
        </Typography>
        <div className={styles.choiceGrid}>
          {NEXT_STEP_OPTIONS.map(opt => (
            <button
              key={opt.id}
              type="button"
              className={styles.choiceCard}
              onClick={opt.id === 'practice' ? onPractice : onChallenge}
            >
              <span className={styles.cardIcon} style={{color: opt.iconColor}}>
                <FontAwesomeV6Icon iconName={opt.icon} />
              </span>
              <span className={styles.cardLabel}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default NextStepPicker;
