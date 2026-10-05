import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

import {StepAnswers} from '../../progress';
import {Checkpoint, Step} from '../../types';

import LevelStep from './LevelStep';
import PanelsStep from './PanelsStep';
import QuestionsStep from './QuestionsStep';

import styles from './stepPlayer.module.scss';
import shared from '../shared.module.scss';

const NO_ANSWERS: StepAnswers = {};

interface StepPlayerProps {
  checkpoint: Checkpoint;
  /** Label for the last step's button. */
  finishLabel?: string;
  answers: {[stepId: string]: StepAnswers};
  onSelectChoice: (
    stepId: string,
    questionId: number,
    choiceId: string
  ) => void;
  onExit: () => void;
  onFinish: () => void;
}

/** Plays a checkpoint's steps in order, then reports the checkpoint finished. */
const StepPlayer: React.FunctionComponent<StepPlayerProps> = ({
  checkpoint,
  finishLabel = 'Complete checkpoint',
  answers,
  onSelectChoice,
  onExit,
  onFinish,
}) => {
  const [index, setIndex] = useState(0);
  const steps = checkpoint.steps;
  const step = steps[index];
  const last = index === steps.length - 1;
  const continueLabel = last ? finishLabel : 'Continue';
  const advance = () => (last ? onFinish() : setIndex(index + 1));

  const renderStep = (step: Step) => {
    switch (step.kind) {
      case 'panels':
        return <PanelsStep key={step.id} step={step} onComplete={advance} />;
      case 'level':
        return (
          <LevelStep
            key={step.id}
            step={step}
            continueLabel={continueLabel}
            onComplete={advance}
          />
        );
      case 'questions':
        return (
          <QuestionsStep
            key={step.id}
            step={step}
            answers={answers[step.id] ?? NO_ANSWERS}
            onSelectChoice={(questionId, choiceId) =>
              onSelectChoice(step.id, questionId, choiceId)
            }
            onComplete={advance}
          />
        );
    }
  };

  return (
    <div className={styles.player}>
      <div className={styles.playerBar}>
        <MuiButton variant="outlined" size="extraSmall" onClick={onExit}>
          <FontAwesomeV6Icon iconName="map" />
          &nbsp;Back to map
        </MuiButton>
        <div className={styles.playerBarTitle}>
          <MuiTypography variant="overline3">{checkpoint.title}</MuiTypography>
          <MuiTypography variant="body3" className={shared.muted}>
            /
          </MuiTypography>
          <MuiTypography variant="strong">{step.title}</MuiTypography>
        </div>
        {steps.length > 1 && (
          <>
            <div className={styles.dots} aria-hidden>
              {steps.map((s, i) => (
                <span
                  key={s.id}
                  className={classNames(
                    styles.dot,
                    i < index && styles.dotDone,
                    i === index && styles.dotCurrent
                  )}
                />
              ))}
            </div>
            <MuiTypography variant="body4" className={shared.muted}>
              Step {index + 1} of {steps.length}
            </MuiTypography>
          </>
        )}
      </div>
      <div className={styles.playerBody}>{renderStep(step)}</div>
    </div>
  );
};

export default StepPlayer;
