import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import IdleTimer from 'react-idle-timer';

import {Answer, StepAnswers} from '../../progress';
import {Checkpoint, Step} from '../../types';
import {usePathwayContext} from '../PathwayContext';

import LevelStep from './LevelStep';
import PanelsStep from './PanelsStep';
import QuestionsStep from './QuestionsStep';

import styles from './stepPlayer.module.scss';
import shared from '../shared.module.scss';

const NO_ANSWERS: StepAnswers = {};

// Lab2IdleTimer's threshold. Its timer is not shared: every milestone resets it.
const IDLE_AFTER_MS = 1000 * 60 * 2;

interface StepClock {
  from: number;
  idleMs: number;
  idleFrom?: number;
}

interface StepPlayerProps {
  checkpoint: Checkpoint;
  /** Label for the last step's button. */
  finishLabel?: string;
  onStartStep: (step: Step) => void;
  onCompleteStep: (step: Step, timeMs: number) => void;
  onLeaveStep: (step: Step, timeMs: number) => void;
  onSaveAnswers: (
    step: Step,
    questionId: number,
    answers: Answer[],
    timeMs: number
  ) => void;
  onExit: () => void;
  onFinish: () => void;
}

/** Plays a checkpoint's steps in order, then reports the checkpoint finished. */
const StepPlayer: React.FunctionComponent<StepPlayerProps> = ({
  checkpoint,
  finishLabel = 'Complete checkpoint',
  onStartStep,
  onCompleteStep,
  onLeaveStep,
  onSaveAnswers,
  onExit,
  onFinish,
}) => {
  const {stepContextMap} = usePathwayContext();
  const [index, setIndex] = useState(0);
  const steps = checkpoint.steps;
  const step = steps[index];
  const last = index === steps.length - 1;
  const continueLabel = last ? finishLabel : 'Continue';

  // Counts from when the current step was shown or its time last reported.
  const clock = useRef<StepClock>({from: Date.now(), idleMs: 0});
  const takeElapsed = useCallback(() => {
    const {from, idleMs, idleFrom} = clock.current;
    const now = Date.now();
    const idle = idleMs + (idleFrom === undefined ? 0 : now - idleFrom);
    clock.current = {
      from: now,
      idleMs: 0,
      idleFrom: idleFrom === undefined ? undefined : now,
    };
    return now - from - idle;
  }, []);

  useEffect(() => {
    takeElapsed(); // Restarts the clock for this step.
    onStartStep(step);
  }, [step, onStartStep, takeElapsed]);

  const advance = () => {
    onCompleteStep(step, takeElapsed());
    if (last) onFinish();
    else setIndex(index + 1);
  };

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
            answers={stepContextMap[step.id]?.answers ?? NO_ANSWERS}
            onSaveAnswers={(questionId, list) =>
              onSaveAnswers(step, questionId, list, takeElapsed())
            }
            onComplete={advance}
          />
        );
      default:
        // Other step kinds arrive in later changes.
        return (
          <div className={styles.stepFallback}>
            <MuiTypography variant="body3" className={shared.muted}>
              This step type ({(step as Step).kind}) is not available yet.
            </MuiTypography>
            <MuiButton variant="contained" onClick={advance}>
              {continueLabel}
            </MuiButton>
          </div>
        );
    }
  };

  return (
    <div className={styles.player}>
      <IdleTimer
        timeout={IDLE_AFTER_MS}
        onIdle={() => {
          clock.current.idleFrom ??= Date.now();
        }}
        onActive={() => {
          const c = clock.current;
          if (c.idleFrom === undefined) return;
          c.idleMs += Date.now() - c.idleFrom;
          c.idleFrom = undefined;
        }}
      />
      <div className={styles.playerBar}>
        <MuiButton
          variant="outlined"
          size="extraSmall"
          onClick={() => {
            onLeaveStep(step, takeElapsed());
            onExit();
          }}
        >
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
