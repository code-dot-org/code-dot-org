import {Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';

import {PanelsStep as PanelsStepContent} from './types';

import styles from './adaptiveView.module.scss';

interface PanelsStepProps {
  step: PanelsStepContent;
  // Called when the student continues past the last panel.
  onComplete: () => void;
}

const PanelsStep: React.FunctionComponent<PanelsStepProps> = ({
  step,
  onComplete,
}) => {
  const [index, setIndex] = useState(0);
  const panel = step.panels[index];
  const isLast = index >= step.panels.length - 1;

  return (
    <div className={styles.panelsStep}>
      {panel && (
        <div key={index} className={`${styles.panel} ${styles.questionEnter}`}>
          {panel.imageUrl && (
            <img className={styles.panelImage} src={panel.imageUrl} alt="" />
          )}
          <p className={styles.panelCaption}>{panel.caption}</p>
        </div>
      )}
      <div className={styles.panelNav}>
        {index > 0 && (
          <MuiButton
            type="button"
            variant="outlined"
            size="large"
            className={styles.pillButton}
            onClick={() => setIndex(index - 1)}
          >
            Back
          </MuiButton>
        )}
        <MuiButton
          type="button"
          variant="contained"
          color="primary"
          size="large"
          className={styles.pillButton}
          onClick={() => (isLast ? onComplete() : setIndex(index + 1))}
        >
          {isLast ? 'Continue' : 'Next'}
        </MuiButton>
      </div>
      {step.panels.length > 1 && (
        <div className={styles.panelCount} aria-live="polite">
          {index + 1} / {step.panels.length}
        </div>
      )}
    </div>
  );
};

export default PanelsStep;
