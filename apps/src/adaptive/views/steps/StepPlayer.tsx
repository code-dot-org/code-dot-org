import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import Lab2ProgressTimer from '@cdo/apps/lab2/utils/Lab2ProgressTimer';

import {Answer, Progress, StepAnswers, visibleSteps} from '../../progress';
import {Checkpoint, Step} from '../../types';
import AdaptiveHeader from '../AdaptiveHeader';
import {checkpointStepFromUrl, updateUrl} from '../checkpointUrl';
import {usePathwayContext} from '../PathwayContext';

import LevelStep from './LevelStep';
import PanelsStep from './PanelsStep';
import QuestionsStep from './QuestionsStep';
import ReviewStep from './ReviewStep';
import VideoStep from './VideoStep';

import styles from './stepPlayer.module.scss';
import shared from '../shared.module.scss';

const NO_ANSWERS: StepAnswers = {};

interface StepPlayerProps {
  checkpoint: Checkpoint;
  /** Label for the last step's button. */
  finishLabel?: string;
  /** The header's title in place of the checkpoint's and step's. */
  headerTitle?: string;
  /** Step ID to jump to on mount (from URL param). Falls back to step 0. */
  initialStepId?: string;
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
  /** Leaves for the final project; the header offers it when given. */
  onFinishPathway?: () => void;
}

/** The progress with one question's answers replaced, before the store reports them. */
function withAnswers(
  progress: Progress,
  stepId: string,
  questionId: number,
  answers: Answer[]
): Progress {
  const entry = progress.steps[stepId];
  return {
    steps: {
      ...progress.steps,
      [stepId]: {
        ...(entry ?? {timeSpent: 0}),
        answers: {...entry?.answers, [questionId]: answers},
      },
    },
  };
}

/**
 * Plays a checkpoint's visible steps in order, then reports the checkpoint
 * finished. A step behind a showIf appears once its answer is in, so the
 * current step is tracked by id rather than position.
 */
const StepPlayer: React.FunctionComponent<StepPlayerProps> = ({
  checkpoint,
  finishLabel = 'Complete checkpoint',
  headerTitle,
  initialStepId,
  onStartStep,
  onCompleteStep,
  onLeaveStep,
  onSaveAnswers,
  onExit,
  onFinish,
  onFinishPathway,
}) => {
  const {progress} = usePathwayContext();
  const steps = useMemo(
    () => visibleSteps(checkpoint, progress),
    [checkpoint, progress]
  );
  const [currentStepId, setCurrentStepId] = useState(
    () => initialStepId ?? checkpoint.steps[0].id
  );
  const currentStepIndex = Math.max(
    0,
    steps.findIndex(s => s.id === currentStepId)
  );
  const step = steps[currentStepIndex];
  const last = currentStepIndex === steps.length - 1;
  const continueLabel = last ? finishLabel : 'Continue';
  // Answers saved this render, so advancing right after a save sees the
  // steps that answer reveals before the next render does.
  const latestProgress = useRef(progress);
  latestProgress.current = progress;

  // Lab2IdleTimer, mounted above every Lab2 lab, keeps this clock's idle time.
  const takeElapsed = useCallback(() => {
    const clock = Lab2ProgressTimer.getInstance();
    const elapsed = clock.getTimeSinceLastMilestone();
    clock.resetMilestoneTimer();
    return elapsed;
  }, []);

  useEffect(() => {
    updateUrl(checkpoint.id, step.id);
  }, [checkpoint.id, step.id]);

  useEffect(() => {
    const handler = () => {
      const {checkpointId, stepId} = checkpointStepFromUrl();
      if (checkpointId !== checkpoint.id || !stepId) return;
      if (steps.some(s => s.id === stepId)) setCurrentStepId(stepId);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [checkpoint.id, steps]);

  useEffect(() => {
    takeElapsed(); // Restarts the clock for this step.
    onStartStep(step);
  }, [step, onStartStep, takeElapsed]);

  const leave = (then: () => void) => {
    onLeaveStep(step, takeElapsed());
    then();
  };

  const advance = () => {
    onCompleteStep(step, takeElapsed());
    // Read visible steps from the ref, not the `steps` memo: an answer saved
    // in this same click can decide which step plays next, and the memo
    // lags until progress updates on the next render.
    const visibleStepsFromLatestProgress = visibleSteps(
      checkpoint,
      latestProgress.current
    );
    const activeStepIndex = visibleStepsFromLatestProgress.findIndex(
      s => s.id === step.id
    );
    if (
      activeStepIndex < 0 ||
      activeStepIndex === visibleStepsFromLatestProgress.length - 1
    )
      onFinish();
    else
      setCurrentStepId(visibleStepsFromLatestProgress[activeStepIndex + 1].id);
  };

  const saveAnswers = (questionId: number, list: Answer[]) => {
    // Keep a copy of progress with these answers applied: they can decide
    // which step plays next, and the context's progress will not have them
    // until the next render.
    latestProgress.current = withAnswers(
      latestProgress.current,
      step.id,
      questionId,
      list
    );
    onSaveAnswers(step, questionId, list, takeElapsed());
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
            answers={progress.steps[step.id]?.answers ?? NO_ANSWERS}
            onSaveAnswers={saveAnswers}
            onComplete={advance}
          />
        );
      case 'review':
        return (
          <ReviewStep
            key={step.id}
            step={step}
            onSaveAnswers={list => saveAnswers(step.questionId, list)}
            onComplete={advance}
          />
        );
      case 'video':
        return (
          <VideoStep
            key={step.id}
            step={step}
            continueLabel={continueLabel}
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
      <AdaptiveHeader
        title={headerTitle ?? `${checkpoint.title}: ${step.title}`}
        onViewSkillTree={() => leave(onExit)}
        onFinish={onFinishPathway && (() => leave(onFinishPathway))}
      />
      <div className={styles.playerBody}>{renderStep(step)}</div>
    </div>
  );
};

export default StepPlayer;
