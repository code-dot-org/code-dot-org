import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useState} from 'react';
import {createPortal} from 'react-dom';

import {LAB_CONTROLS_ID} from '@cdo/apps/code-studio/components/header/SimpleHeader';
import {setSimpleHeaderOverride} from '@cdo/apps/code-studio/headerRedux';
import Lab2ProgressTimer from '@cdo/apps/lab2/utils/Lab2ProgressTimer';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {Answer, StepAnswers} from '../../progress';
import {Checkpoint, Step} from '../../types';
import {usePathwayContext} from '../PathwayContext';

import LevelStep from './LevelStep';
import PanelsStep from './PanelsStep';
import QuestionsStep from './QuestionsStep';
import VideoStep from './VideoStep';

import styles from './stepPlayer.module.scss';
import shared from '../shared.module.scss';
import headerStyles from '@cdo/apps/code-studio/components/header/project-header.module.scss';

const NO_ANSWERS: StepAnswers = {};

interface StepPlayerProps {
  checkpoint: Checkpoint;
  /** Label for the last step's button. */
  finishLabel?: string;
  /** Hides the header's bar, for a checkpoint that is not part of the map. */
  hideProgress?: boolean;
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
  hideProgress = false,
  onStartStep,
  onCompleteStep,
  onLeaveStep,
  onSaveAnswers,
  onExit,
  onFinish,
}) => {
  const dispatch = useAppDispatch();
  const {progress} = usePathwayContext();
  const [index, setIndex] = useState(0);
  // Absent when the unit's header is not SimpleHeader.
  const [headerControls] = useState(() =>
    document.getElementById(LAB_CONTROLS_ID)
  );
  const steps = checkpoint.steps;
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
    takeElapsed(); // Restarts the clock for this step.
    onStartStep(step);
  }, [step, onStartStep, takeElapsed]);

  useEffect(() => {
    dispatch(
      setSimpleHeaderOverride(
        hideProgress
          ? {name: checkpoint.title}
          : {
              name: checkpoint.title,
              progress: {
                position: index + 1,
                total: steps.length,
                valueText: `Step ${index + 1} of ${steps.length}`,
              },
            }
      )
    );
  }, [dispatch, checkpoint.title, hideProgress, index, steps.length]);

  const exit = () => {
    onLeaveStep(step, takeElapsed());
    onExit();
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
      {headerControls ? (
        createPortal(
          <button
            type="button"
            className={classNames(
              headerStyles.buttonSpacing,
              'header_button',
              'header_button_light',
              'no-mc'
            )}
            onClick={exit}
            aria-label="Back to map"
          >
            <FontAwesomeV6Icon iconName="map" />
            <span className={headerStyles.buttonText}>&nbsp;Back to map</span>
          </button>,
          headerControls
        )
      ) : (
        <div className={styles.backFallback}>
          <MuiButton variant="outlined" size="extraSmall" onClick={exit}>
            <FontAwesomeV6Icon iconName="map" />
            &nbsp;Back to map
          </MuiButton>
        </div>
      )}
      <div className={styles.playerBody}>{renderStep(step)}</div>
    </div>
  );
};

export default StepPlayer;
