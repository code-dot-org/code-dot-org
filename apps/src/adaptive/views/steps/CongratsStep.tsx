// Plays the congrats panel a step names. Each panel is a component of its
// own; the step's markdown, link and logo are its card.

import React from 'react';

import {CongratsStep as CongratsStepContent} from '../../types';

import Hoai2026Congrats from './congrats/Hoai2026Congrats';

export interface CongratsPanelProps {
  step: CongratsStepContent;
  /** Ends the step, and with it the pathway. */
  onComplete: () => void;
}

const PANELS: {
  [id in CongratsStepContent['panelId']]: React.FunctionComponent<CongratsPanelProps>;
} = {
  hoai2026: Hoai2026Congrats,
};

const CongratsStep: React.FunctionComponent<CongratsPanelProps> = ({
  step,
  onComplete,
}) => {
  const Panel = PANELS[step.panelId];
  return <Panel step={step} onComplete={onComplete} />;
};

export default CongratsStep;
