import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useCallback, useEffect} from 'react';

import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {LabProps} from '@cdo/apps/lab2/types';
import Loading from '@cdo/apps/lab2/views/Loading';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  answerRecorded,
  completeCurrentStep,
  loadProgress,
} from './adaptiveRedux';
import PanelsStep from './PanelsStep';
import QuestionFlow from './QuestionFlow';
import {AdaptiveLevelProperties, AnswerRecord, stepById} from './types';

import moduleStyles from './adaptiveView.module.scss';

const AdaptiveView: React.FunctionComponent<
  LabProps<AdaptiveLevelProperties>
> = ({levelProperties}) => {
  const dispatch = useAppDispatch();
  const {adaptiveContent: content, appName, id: levelId} = levelProperties;
  const scriptId = useAppSelector(state => state.progress.scriptId);
  const progress = useAppSelector(state => state.adaptive);

  useEffect(() => {
    if (content) dispatch(loadProgress(content, scriptId, levelId));
  }, [dispatch, content, scriptId, levelId]);

  const onAnswer = useCallback(
    (record: AnswerRecord) => dispatch(answerRecorded(record)),
    [dispatch]
  );
  const onStepComplete = useCallback(() => {
    if (content) dispatch(completeCurrentStep(content, appName));
  }, [dispatch, content, appName]);
  const onContinue = useCallback(
    () => dispatch(continueOrFinishLesson()),
    [dispatch]
  );

  if (!content) {
    return (
      <div className={moduleStyles.container}>
        <MuiTypography variant="body1">
          This level has no content file.
        </MuiTypography>
      </div>
    );
  }
  if (progress.status !== 'ready' || progress.levelId !== levelId) {
    return <Loading isLoading />;
  }

  const step = stepById(content, progress.currentStepId);
  if (progress.completed || !step) {
    return (
      <div className={moduleStyles.container}>
        <div className={moduleStyles.finished}>
          <MuiTypography variant="h1">{content.title}</MuiTypography>
          <MuiTypography variant="body1">
            You finished this lesson.
          </MuiTypography>
          <MuiButton
            variant="contained"
            color="primary"
            size="large"
            className={moduleStyles.pillButton}
            onClick={onContinue}
          >
            Continue
          </MuiButton>
        </div>
      </div>
    );
  }

  const stepNumber = content.steps.indexOf(step) + 1;
  return (
    <div className={moduleStyles.container}>
      <header className={moduleStyles.header}>
        <MuiTypography variant="body2" className={moduleStyles.lessonTitle}>
          {content.title}
        </MuiTypography>
        <MuiTypography variant="h2" className={moduleStyles.stepTitle}>
          {step.title}
        </MuiTypography>
        <MuiTypography variant="body3" className={moduleStyles.stepCount}>
          Step {stepNumber} of {content.steps.length}
        </MuiTypography>
      </header>
      <main className={moduleStyles.body}>
        {step.kind === 'panels' ? (
          <PanelsStep key={step.id} step={step} onComplete={onStepComplete} />
        ) : (
          <QuestionFlow
            key={step.id}
            step={step}
            answers={progress.answers}
            onAnswer={onAnswer}
            onComplete={onStepComplete}
          />
        )}
      </main>
    </div>
  );
};

export default AdaptiveView;
