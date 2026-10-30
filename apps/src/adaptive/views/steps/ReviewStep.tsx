// Shows the student their plan, the checkpoint's template filled from their
// answers, and takes their decision: build a first version from it, or skip
// to editing by hand. The decision is saved as the step's answer; a build is
// also requested of the pathway, for the project step after to carry out.

import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useEffect, useRef} from 'react';

import AttemptCard from '@cdo/apps/quiz/attempt/AttemptCard';

import {isAdaptiveAiEnabled} from '../../ai/generate';
import {Answer} from '../../progress';
import {answersBySlot, checkpointPlan} from '../../project/plan';
import {planTemplateSegments} from '../../schema/planTemplate';
import {ReviewDecision} from '../../schema/steps/review';
import {ReviewStep as ReviewStepContent} from '../../types';
import {usePathwayContext} from '../PathwayContext';

import styles from './stepPlayer.module.scss';

interface ReviewStepProps {
  step: ReviewStepContent;
  onSaveAnswers: (answers: Answer[]) => void;
  onComplete: () => void;
}

const ReviewStep: React.FunctionComponent<ReviewStepProps> = ({
  step,
  onSaveAnswers,
  onComplete,
}) => {
  const {checkpoint, progress, setBuildRequested} = usePathwayContext();
  const decide = (decision: ReviewDecision) => {
    onSaveAnswers([{answerId: decision}]);
    setBuildRequested(decision === 'build');
    onComplete();
  };
  const {answers} = checkpointPlan(checkpoint, progress);
  const bySlot = answersBySlot(answers);
  const segments = checkpoint.plan
    ? planTemplateSegments(checkpoint.plan.template)
    : [];
  // With adaptive AI off a build would land on the template; offer only the skip.
  const canBuild = isAdaptiveAiEnabled();

  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <div className={styles.questionsStep}>
      <div className={styles.questionsIntro}>
        <MuiTypography variant="h2" tabIndex={-1} ref={titleRef}>
          {step.title}
        </MuiTypography>
        {step.description && (
          <MuiTypography variant="body2">{step.description}</MuiTypography>
        )}
      </div>
      <AttemptCard title="A prompt to get you started">
        {answers.length > 0 && (
          <dl className={styles.reviewAnswers}>
            {answers.map(({slot, question, answer}) => (
              <div key={slot} className={styles.reviewAnswer}>
                <MuiTypography variant="body3" component="dt">
                  {question}
                </MuiTypography>
                <MuiTypography variant="body2" component="dd">
                  {answer}
                </MuiTypography>
              </div>
            ))}
          </dl>
        )}
        {segments.length > 0 && (
          <MuiTypography variant="body1" className={styles.reviewPlan}>
            {segments.map((segment, i) =>
              'text' in segment ? (
                <React.Fragment key={i}>{segment.text}</React.Fragment>
              ) : (
                <strong key={i}>{bySlot[segment.slot] ?? '…'}</strong>
              )
            )}
          </MuiTypography>
        )}
      </AttemptCard>
      <div className={styles.questionsActions}>
        <MuiButton
          variant={canBuild ? 'outlined' : 'contained'}
          color="primary"
          size="medium"
          type="button"
          onClick={() => decide('skip')}
        >
          {step.skipLabel ?? 'Skip'}
        </MuiButton>
        {canBuild && (
          <MuiButton
            variant="contained"
            color="primary"
            size="medium"
            type="button"
            onClick={() => decide('build')}
          >
            {step.buildLabel ?? 'Build site'}
          </MuiButton>
        )}
      </div>
    </div>
  );
};

export default ReviewStep;
