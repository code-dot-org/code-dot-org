import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {Checkpoint, Step} from '@cdo/apps/adaptive/types';
import {
  PathwayContext,
  PathwayContextValue,
} from '@cdo/apps/adaptive/views/PathwayContext';
import StepPlayer from '@cdo/apps/adaptive/views/steps/StepPlayer';
import Lab2ProgressTimer from '@cdo/apps/lab2/utils/Lab2ProgressTimer';

const timer = Lab2ProgressTimer.getInstance();

// A kind the player has no view for, so it shows its own Continue button.
const placeholder = (id: string) =>
  ({id, title: id, kind: 'later'} as unknown as Step);

const checkpoint: Checkpoint = {
  id: 'basics',
  title: 'Basics',
  description: 'Basics',
  steps: [placeholder('one'), placeholder('two')],
};

describe('StepPlayer', () => {
  let now: jest.SpyInstance;

  beforeEach(() => {
    now = jest.spyOn(Date, 'now').mockReturnValue(1000);
  });

  afterEach(() => now.mockRestore());

  const renderPlayer = (initialStepId?: string) => {
    const calls: unknown[][] = [];
    const record =
      (name: string) =>
      (...args: unknown[]) =>
        calls.push([name, ...args]);
    const onExit = jest.fn();
    const onFinish = jest.fn();
    render(
      <PathwayContext.Provider
        value={{stepContextMap: {}} as unknown as PathwayContextValue}
      >
        <StepPlayer
          checkpoint={checkpoint}
          initialStepId={initialStepId}
          onStartStep={record('start')}
          onCompleteStep={record('complete')}
          onLeaveStep={record('leave')}
          onSaveAnswers={record('answers')}
          onExit={onExit}
          onFinish={onFinish}
        />
      </PathwayContext.Provider>
    );
    return {calls, onExit, onFinish};
  };

  it('reports each step started when shown and complete when advanced from', () => {
    const {calls, onFinish} = renderPlayer();

    now.mockReturnValue(4000);
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
    now.mockReturnValue(4500);
    fireEvent.click(screen.getByRole('button', {name: 'Complete checkpoint'}));

    expect(calls).toEqual([
      ['start', checkpoint.steps[0]],
      ['complete', checkpoint.steps[0], 3000],
      ['start', checkpoint.steps[1]],
      ['complete', checkpoint.steps[1], 500],
    ]);
    expect(onFinish).toHaveBeenCalled();
  });

  it('reports the time on a step left for the map', () => {
    const {calls, onExit} = renderPlayer();

    now.mockReturnValue(3500);
    fireEvent.click(screen.getByRole('button', {name: /Back to map/}));

    expect(calls).toEqual([
      ['start', checkpoint.steps[0]],
      ['leave', checkpoint.steps[0], 2500],
    ]);
    expect(onExit).toHaveBeenCalled();
  });

  it('leaves idle time out of the time on a step', () => {
    const {calls} = renderPlayer();

    now.mockReturnValue(2000);
    timer.startIdle();
    now.mockReturnValue(6000);
    timer.endIdle();
    now.mockReturnValue(8000);
    timer.startIdle();
    now.mockReturnValue(9000);
    fireEvent.click(screen.getByRole('button', {name: /Back to map/}));

    expect(calls).toEqual([
      ['start', checkpoint.steps[0]],
      ['leave', checkpoint.steps[0], 3000],
    ]);
  });

  describe('URL parameters', () => {
    let replaceState: jest.SpyInstance;
    const originalUrl = window.location.href;

    beforeEach(() => {
      replaceState = jest.spyOn(window.history, 'replaceState');
      window.history.replaceState({}, '', '/');
    });

    afterEach(() => {
      replaceState.mockRestore();
      window.history.replaceState({}, '', originalUrl);
    });

    it('writes checkpoint and step ids to the URL on mount', () => {
      renderPlayer();

      expect(replaceState).toHaveBeenCalledWith(
        null,
        '',
        '?checkpoint=basics&step=one'
      );
    });

    it('updates the URL when advancing to the next step', () => {
      renderPlayer();
      replaceState.mockClear();

      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

      expect(replaceState).toHaveBeenCalledWith(
        null,
        '',
        '?checkpoint=basics&step=two'
      );
    });

    it('starts on the step matching initialStepId', () => {
      renderPlayer('two');

      expect(screen.getByText('Step 2 of 2')).toBeTruthy();
      expect(replaceState).toHaveBeenCalledWith(
        null,
        '',
        '?checkpoint=basics&step=two'
      );
    });

    it('falls back to step 0 when initialStepId is not found', () => {
      renderPlayer('unknown-step');

      expect(screen.getByText('Step 1 of 2')).toBeTruthy();
      expect(replaceState).toHaveBeenCalledWith(
        null,
        '',
        '?checkpoint=basics&step=one'
      );
    });
  });
});
