import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {Checkpoint, Step} from '@cdo/apps/adaptive/types';
import {
  PathwayContext,
  PathwayContextValue,
} from '@cdo/apps/adaptive/views/PathwayContext';
import StepPlayer from '@cdo/apps/adaptive/views/steps/StepPlayer';
import Lab2ProgressTimer from '@cdo/apps/lab2/utils/Lab2ProgressTimer';

jest.mock('@cdo/apps/adaptive/views/AdaptiveHeader', () => ({
  __esModule: true,
  default: ({
    title,
    onViewSkillTree,
    onFinish,
  }: {
    title: string;
    onViewSkillTree?: () => void;
    onFinish?: () => void;
  }) => (
    <div>
      header: {title}
      {onViewSkillTree && (
        <button type="button" onClick={onViewSkillTree}>
          View skill tree
        </button>
      )}
      {onFinish && (
        <button type="button" onClick={onFinish}>
          I'm finished!
        </button>
      )}
    </div>
  ),
}));

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

  const renderPlayer = (
    props: Partial<React.ComponentProps<typeof StepPlayer>> = {}
  ) => {
    const calls: unknown[][] = [];
    const record =
      (name: string) =>
      (...args: unknown[]) =>
        calls.push([name, ...args]);
    const onExit = jest.fn();
    const onFinish = jest.fn();
    render(
      <PathwayContext.Provider
        value={{progress: {steps: {}}} as unknown as PathwayContextValue}
      >
        <StepPlayer
          checkpoint={checkpoint}
          onStartStep={record('start')}
          onCompleteStep={record('complete')}
          onLeaveStep={record('leave')}
          onSaveAnswers={record('answers')}
          onExit={onExit}
          onFinish={onFinish}
          {...props}
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
    fireEvent.click(screen.getByRole('button', {name: 'View skill tree'}));

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
    fireEvent.click(screen.getByRole('button', {name: 'View skill tree'}));

    expect(calls).toEqual([
      ['start', checkpoint.steps[0]],
      ['leave', checkpoint.steps[0], 3000],
    ]);
  });

  it("titles the header with the checkpoint's and the step's titles", () => {
    renderPlayer();
    expect(screen.getByText('header: Basics: one')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
    expect(screen.getByText('header: Basics: two')).toBeTruthy();
  });

  it('titles the header with the title it is given', () => {
    renderPlayer({headerTitle: 'My Project'});
    expect(screen.getByText('header: My Project')).toBeTruthy();
  });

  it('reports the time on a step left for the final project', () => {
    const onFinishPathway = jest.fn();
    const {calls} = renderPlayer({onFinishPathway});

    now.mockReturnValue(2500);
    fireEvent.click(screen.getByRole('button', {name: "I'm finished!"}));

    expect(calls).toEqual([
      ['start', checkpoint.steps[0]],
      ['leave', checkpoint.steps[0], 1500],
    ]);
    expect(onFinishPathway).toHaveBeenCalled();
  });

  it('offers no way to the final project without a handler for it', () => {
    renderPlayer();
    expect(screen.queryByRole('button', {name: "I'm finished!"})).toBeNull();
  });
});
