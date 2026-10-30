import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useCallback, useEffect, useState} from 'react';

import Lab2ProgressTimer from '@cdo/apps/lab2/utils/Lab2ProgressTimer';

import {Answer, StepAnswers} from '../../progress';
import {Checkpoint, Step} from '../../types';
import AdaptiveHeader from '../AdaptiveHeader';
import {checkpointStepFromUrl, updateUrl} from '../checkpointUrl';
import {usePathwayContext} from '../PathwayContext';

import LevelStep from './LevelStep';
import MarkdownStep from './MarkdownStep';
import PanelsStep from './PanelsStep';
import QuestionsStep from './QuestionsStep';
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

/** Plays a checkpoint's steps in order, then reports the checkpoint finished. */
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
  const steps = checkpoint.steps;
  const [index, setIndex] = useState(() => {
    if (!initialStepId) return 0;
    const i = steps.findIndex(s => s.id === initialStepId);
    return i >= 0 ? i : 0;
  });
  const step = steps[index];
  const last = index === steps.length - 1;
  const continueLabel = last ? finishLabel : 'Continue';

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
      const i = steps.findIndex(s => s.id === stepId);
      if (i >= 0) setIndex(i);
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
            answers={progress.steps[step.id]?.answers ?? NO_ANSWERS}
            onSaveAnswers={(questionId, list) =>
              onSaveAnswers(step, questionId, list, takeElapsed())
            }
            onComplete={advance}
          />
        );
      case 'markdown':
        return (
          <MarkdownStep
            key={step.id}
            step={step}
            continueLabel={continueLabel}
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
