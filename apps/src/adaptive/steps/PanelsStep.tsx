import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

import {Step} from '../types';

import moduleStyles from '../pathway.module.scss';

interface PanelsStepProps {
  step: Extract<Step, {kind: 'panels'}>;
  continueLabel: string;
  onComplete: () => void;
}

const PanelsStep: React.FunctionComponent<PanelsStepProps> = ({
  step,
  continueLabel,
  onComplete,
}) => {
  const [index, setIndex] = useState(0);
  const panel = step.panels[index];
  const last = index === step.panels.length - 1;

  return (
    <div className={moduleStyles.panels}>
      <div className={moduleStyles.panelCard}>
        {panel.imageUrl && (
          <img
            src={panel.imageUrl}
            alt=""
            className={moduleStyles.panelImage}
          />
        )}
        <MuiTypography variant="h3">{panel.caption}</MuiTypography>
      </div>
      <div className={moduleStyles.panelNav}>
        <MuiButton
          variant="outlined"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          Back
        </MuiButton>
        <div className={moduleStyles.dots} aria-hidden>
          {step.panels.map((_, i) => (
            <span
              key={i}
              className={classNames(
                moduleStyles.dot,
                i < index && moduleStyles.dotDone,
                i === index && moduleStyles.dotCurrent
              )}
            />
          ))}
        </div>
        <MuiButton
          variant="contained"
          onClick={() => (last ? onComplete() : setIndex(index + 1))}
        >
          {last ? continueLabel : 'Next'}
        </MuiButton>
      </div>
    </div>
  );
};

export default PanelsStep;
