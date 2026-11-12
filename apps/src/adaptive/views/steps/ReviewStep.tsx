// Shows the student their plan, the checkpoint's template filled from their
// answers, and takes their decision: build a first version from it, or skip
// to editing by hand. The decision is saved as the step's answer; a build is
// also requested of the pathway, for the project step after to carry out.

import {MuiDialog} from '@code-dot-org/component-library/dialog';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import {asProjectSources} from '@cdo/apps/lab2/utils/getInitialSources';
import AttemptCard from '@cdo/apps/quiz/attempt/AttemptCard';

import {isAdaptiveAiEnabled} from '../../ai/generate';
import {Answer} from '../../progress';
import {answersBySlot, checkpointPlan} from '../../project/plan';
import {differsFromTemplate} from '../../project/projectGeneration';
import {usePathwayProject} from '../../project/usePathwayProject';
import {planTemplateSegments} from '../../schema/planTemplate';
import {ReviewDecision} from '../../schema/steps/review';
import {Pathway, ReviewStep as ReviewStepContent} from '../../types';
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
  const {pathway, checkpoint, progress, setBuildRequested} =
    usePathwayContext();
  const decide = (decision: ReviewDecision) => {
    onSaveAnswers([{answerId: decision}]);
    setBuildRequested(decision === 'build');
    onComplete();
  };
  const hasWork = useProjectHasWork(pathway);
  const [confirmingBuild, setConfirmingBuild] = useState(false);
  const onBuild = () =>
    hasWork === false ? decide('build') : setConfirmingBuild(true);
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
          {hasWork ? 'Continue to your project' : step.skipLabel ?? 'Skip'}
        </MuiButton>
        {canBuild && (
          <MuiButton
            variant="contained"
            color="primary"
            size="medium"
            type="button"
            onClick={onBuild}
          >
            {hasWork ? 'Re-build with AI' : step.buildLabel ?? 'Build site'}
          </MuiButton>
        )}
      </div>
      {confirmingBuild && (
        <MuiDialog
          title="Build your project again?"
          description="Your project already has work in it. Building again will overwrite it and your current project will be lost."
          onClose={() => setConfirmingBuild(false)}
          secondaryButtonProps={{
            children: 'Keep my project',
            onClick: () => setConfirmingBuild(false),
          }}
          primaryButtonProps={{
            children: 'Build again',
            onClick: () => decide('build'),
          }}
        />
      )}
    </div>
  );
};

function useProjectHasWork(pathway: Pathway): boolean | undefined {
  const {sources, isLoading, loadError} = usePathwayProject(pathway);
  if (isLoading || loadError || !sources) return undefined;
  const template = pathway.project.levelProperties;
  return differsFromTemplate(
    sources,
    asProjectSources(template?.templateSources) ??
      asProjectSources(template?.startSources)
  );
}

export default ReviewStep;
