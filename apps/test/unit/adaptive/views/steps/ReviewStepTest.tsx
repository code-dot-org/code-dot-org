import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {Progress} from '@cdo/apps/adaptive/progress/model';
import {
  Checkpoint,
  Pathway,
  ReviewStep as ReviewStepContent,
} from '@cdo/apps/adaptive/types';
import {
  PathwayContext,
  PathwayContextValue,
} from '@cdo/apps/adaptive/views/PathwayContext';
import ReviewStep from '@cdo/apps/adaptive/views/steps/ReviewStep';

jest.mock('@cdo/apps/adaptive/ai/access', () => ({
  isAdaptiveAiAvailable: () => true,
}));
jest.mock('@cdo/apps/adaptive/project/usePathwayProject', () => ({
  usePathwayProject: () => ({isLoading: true}),
}));

const step = {
  id: 'review',
  kind: 'review',
  title: 'Your plan',
  questionId: 7,
} as unknown as ReviewStepContent;

const checkpoint = {id: 'c1', steps: [step]} as unknown as Checkpoint;
const pathway = {project: {templateLevel: 'tmpl'}} as unknown as Pathway;

function renderReview(isViewingStudent: boolean, progress: Progress) {
  const onSaveAnswers = jest.fn();
  const onComplete = jest.fn();
  const setBuildRequested = jest.fn();
  render(
    <PathwayContext.Provider
      value={
        {
          pathway,
          checkpoint,
          progress,
          isViewingStudent,
          setBuildRequested,
        } as unknown as PathwayContextValue
      }
    >
      <ReviewStep
        step={step}
        onSaveAnswers={onSaveAnswers}
        onComplete={onComplete}
      />
    </PathwayContext.Provider>
  );
  return {onSaveAnswers, onComplete, setBuildRequested};
}

const noProgress = {steps: {}} as unknown as Progress;

describe('ReviewStep', () => {
  it('saves the student decision and continues', () => {
    const {onSaveAnswers, onComplete, setBuildRequested} = renderReview(
      false,
      noProgress
    );
    expect(screen.queryByRole('button', {name: /Continue/})).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Skip'}));
    expect(onSaveAnswers).toHaveBeenCalledWith([{answerId: 'skip'}]);
    expect(setBuildRequested).toHaveBeenCalledWith(false);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows a viewing teacher the decision and only lets them continue', () => {
    const progress = {
      steps: {
        review: {answers: {7: [{answerId: 'skip'}, {answerId: 'build'}]}},
      },
    } as unknown as Progress;
    const {onSaveAnswers, onComplete, setBuildRequested} = renderReview(
      true,
      progress
    );
    expect(
      screen.getByText('The student chose to build with AI.')
    ).toBeTruthy();
    const skip = screen.getByRole('button', {name: 'Skip'});
    const build = screen.getByRole('button', {name: 'Build site'});
    expect((skip as HTMLButtonElement).disabled).toBe(true);
    expect((build as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(skip);
    fireEvent.click(build);
    expect(onSaveAnswers).not.toHaveBeenCalled();
    expect(setBuildRequested).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('tells a viewing teacher when the student has not decided', () => {
    renderReview(true, noProgress);
    expect(screen.getByText('The student has not decided yet.')).toBeTruthy();
  });
});
