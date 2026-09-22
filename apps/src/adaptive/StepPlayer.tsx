import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

import {CapabilityState} from './progress';
import LabStep from './steps/LabStep';
import PanelsStep from './steps/PanelsStep';
import QuestionsStep, {
  Answers,
  completedByAnswers,
} from './steps/QuestionsStep';
import {Checkpoint, Step} from './types';

import moduleStyles from './pathway.module.scss';

type QuestionsStepContent = Extract<Step, {kind: 'questions'}>;

interface StepPlayerProps {
  checkpoint: Checkpoint;
  capabilities: CapabilityState;
  /** Answers to show when a questions step opens. */
  initialAnswers: (step: QuestionsStepContent) => Answers;
  onAnswers: (
    step: QuestionsStepContent,
    answers: Answers,
    completedCheckpointIds: string[]
  ) => void;
  onExit: () => void;
  onFinish: () => void;
}

const StepPlayer: React.FunctionComponent<StepPlayerProps> = ({
  checkpoint,
  capabilities,
  initialAnswers,
  onAnswers,
  onExit,
  onFinish,
}) => {
  const [index, setIndex] = useState(0);
  const steps = checkpoint.steps;
  const step = steps[index];
  const last = index === steps.length - 1;
  const continueLabel = last ? 'Complete checkpoint' : 'Continue';
  const advance = () => (last ? onFinish() : setIndex(index + 1));

  const renderStep = (step: Step) => {
    const props = {continueLabel, onComplete: advance};
    switch (step.kind) {
      case 'panels':
        return <PanelsStep key={step.id} step={step} {...props} />;
      case 'questions':
        return (
          <QuestionsStep
            key={step.id}
            step={step}
            initialAnswers={initialAnswers(step)}
            {...props}
            onComplete={answers => {
              onAnswers(step, answers, completedByAnswers(step, answers));
              advance();
            }}
          />
        );
      case 'lab':
        return (
          <LabStep
            key={step.id}
            step={step}
            capabilities={capabilities}
            {...props}
          />
        );
    }
  };

  return (
    <div className={moduleStyles.player}>
      <div className={moduleStyles.playerBar}>
        <MuiButton variant="text" size="small" onClick={onExit}>
          <FontAwesomeV6Icon iconName="arrow-left" />
          &nbsp;Back to map
        </MuiButton>
        <div className={moduleStyles.playerBarTitle}>
          <MuiTypography variant="overline3">{checkpoint.title}</MuiTypography>
          <MuiTypography variant="strong">{step.title}</MuiTypography>
        </div>
        <div className={moduleStyles.dots} aria-hidden>
          {steps.map((s, i) => (
            <span
              key={s.id}
              className={classNames(
                moduleStyles.dot,
                i < index && moduleStyles.dotDone,
                i === index && moduleStyles.dotCurrent
              )}
            />
          ))}
        </div>
        <MuiTypography variant="body4">
          Step {index + 1} of {steps.length}
        </MuiTypography>
      </div>
      <div className={moduleStyles.playerBody}>{renderStep(step)}</div>
    </div>
  );
};

export default StepPlayer;
