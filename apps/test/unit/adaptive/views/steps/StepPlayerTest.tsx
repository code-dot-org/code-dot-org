import {act, fireEvent, render, screen} from '@testing-library/react';
import React, {useState} from 'react';

import {Progress} from '@cdo/apps/adaptive/progress';
import {Checkpoint, Step} from '@cdo/apps/adaptive/types';
import {
  PathwayContext,
  PathwayContextValue,
} from '@cdo/apps/adaptive/views/PathwayContext';
import StepPlayer from '@cdo/apps/adaptive/views/steps/StepPlayer';
import Lab2ProgressTimer from '@cdo/apps/lab2/utils/Lab2ProgressTimer';

jest.mock('@cdo/apps/adaptive/ai/generate', () => ({
  isAdaptiveAiEnabled: () => true,
}));

// Reports whether a build is requested of it when it mounts.
jest.mock('@cdo/apps/adaptive/views/steps/LevelStep', () => {
  const React = require('react');
  const {
    usePathwayContext,
  } = require('@cdo/apps/adaptive/views/PathwayContext');
  function FakeLevelStep({
    step,
    onComplete,
  }: {
    step: {id: string};
    onComplete: () => void;
  }) {
    const {buildRequested} = usePathwayContext();
    const [build] = React.useState(buildRequested);
    return (
      <div>
        level: {step.id} build: {String(build)}
        <button type="button" onClick={onComplete}>
          Continue
        </button>
      </div>
    );
  }
  return {__esModule: true, default: FakeLevelStep};
});

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

  describe('URL parameters', () => {
    let replaceState: jest.SpyInstance;
    let pushState: jest.SpyInstance;
    const originalUrl = window.location.href;

    beforeEach(() => {
      replaceState = jest.spyOn(window.history, 'replaceState');
      pushState = jest.spyOn(window.history, 'pushState');
      window.history.replaceState({}, '', '/');
    });

    afterEach(() => {
      replaceState.mockRestore();
      pushState.mockRestore();
      window.history.replaceState({}, '', originalUrl);
    });

    it('writes checkpoint and step ids to the URL on mount', () => {
      renderPlayer();

      expect(pushState).toHaveBeenCalledWith(
        null,
        '',
        '?checkpoint=basics&step=one'
      );
    });

    it('updates the URL when advancing to the next step', () => {
      renderPlayer();
      pushState.mockClear();

      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

      expect(pushState).toHaveBeenCalledWith(
        null,
        '',
        '?checkpoint=basics&step=two'
      );
    });

    it('starts on the step matching initialStepId without adding a history entry', () => {
      // Simulate URL navigation — URL already has the step param.
      window.history.replaceState({}, '', '?checkpoint=basics&step=two');
      pushState.mockClear();
      renderPlayer({initialStepId: 'two'});

      expect(screen.getByText('header: Basics: two')).toBeTruthy();
      // URL already correct → no pushState (avoids a duplicate history entry).
      expect(pushState).not.toHaveBeenCalled();
    });

    it('falls back to step 0 when initialStepId is not found', () => {
      renderPlayer({initialStepId: 'unknown-step'});

      expect(screen.getByText('header: Basics: one')).toBeTruthy();
      expect(pushState).toHaveBeenCalledWith(
        null,
        '',
        '?checkpoint=basics&step=one'
      );
    });

    it('ignores popstate events for a different checkpoint', () => {
      renderPlayer();
      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
      expect(screen.getByText('header: Basics: two')).toBeTruthy();

      pushState.mockClear();
      window.history.replaceState({}, '', '?checkpoint=other&step=one');
      act(() => window.dispatchEvent(new PopStateEvent('popstate')));

      // Step unchanged — the event was for a different checkpoint.
      expect(screen.getByText('header: Basics: two')).toBeTruthy();
      expect(pushState).not.toHaveBeenCalled();
    });

    it('navigates to the previous step when the browser fires popstate', () => {
      renderPlayer();
      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
      expect(screen.getByText('header: Basics: two')).toBeTruthy();

      pushState.mockClear();
      // Simulate browser back: URL reverts to step one, popstate fires.
      window.history.replaceState({}, '', '?checkpoint=basics&step=one');
      act(() => window.dispatchEvent(new PopStateEvent('popstate')));

      expect(screen.getByText('header: Basics: one')).toBeTruthy();
      // URL already correct → no duplicate history entry added.
      expect(pushState).not.toHaveBeenCalled();
    });
  });

  describe('with branching steps', () => {
    const ask: Step = {
      id: 'ask',
      title: 'Ask',
      kind: 'questions',
      questions: [
        {
          id: 1,
          type: 'MultipleChoiceQuestion',
          questionName: 'ask',
          questionTitle: 'Which?',
          choices: [
            {id: 'a', text: 'Choice A'},
            {id: 'b', text: 'Choice B'},
          ],
        },
      ],
    };
    const branched: Checkpoint = {
      ...checkpoint,
      steps: [
        ask,
        {
          ...placeholder('if-a'),
          showIf: {stepId: 'ask', questionId: 1, choiceId: 'a'},
        },
        {
          ...placeholder('if-b'),
          showIf: {stepId: 'ask', questionId: 1, choiceId: 'b'},
        },
        placeholder('after'),
      ],
    };

    // Holds progress as PathwayApp does, so a saved answer reveals its branch.
    const renderBranched = (
      initial: Progress = {steps: {}},
      initialStepId?: string
    ) => {
      const onFinish = jest.fn();
      const Host = () => {
        const [progress, setProgress] = useState(initial);
        return (
          <PathwayContext.Provider
            value={{progress} as unknown as PathwayContextValue}
          >
            <StepPlayer
              checkpoint={branched}
              initialStepId={initialStepId}
              onStartStep={jest.fn()}
              onCompleteStep={jest.fn()}
              onLeaveStep={jest.fn()}
              onSaveAnswers={(step, questionId, list) =>
                setProgress(p => ({
                  steps: {
                    ...p.steps,
                    [step.id]: {
                      timeSpent: 0,
                      answers: {
                        ...p.steps[step.id]?.answers,
                        [questionId]: list,
                      },
                    },
                  },
                }))
              }
              onExit={jest.fn()}
              onFinish={onFinish}
            />
          </PathwayContext.Provider>
        );
      };
      render(<Host />);
      return {onFinish};
    };

    it('goes to the branch the answer reveals, skipping the others', () => {
      const {onFinish} = renderBranched();
      expect(screen.getByText('header: Basics: Ask')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('radio', {name: /Choice B/}));
      fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
      expect(screen.getByText('header: Basics: if-b')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
      expect(screen.getByText('header: Basics: after')).toBeInTheDocument();
      fireEvent.click(
        screen.getByRole('button', {name: 'Complete checkpoint'})
      );
      expect(onFinish).toHaveBeenCalled();
    });

    it('falls back to the first step when asked to start on a hidden branch', () => {
      renderBranched({steps: {}}, 'if-a');
      expect(screen.getByText('header: Basics: Ask')).toBeInTheDocument();
    });

    it('counts the last visible step as the finish', () => {
      const {onFinish} = renderBranched({
        steps: {
          ask: {
            timeSpent: 0,
            status: 'complete',
            answers: {1: [{answerId: 'a'}]},
          },
        },
      });
      fireEvent.click(screen.getByRole('radio', {name: /Choice A/}));
      fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
      expect(screen.getByText('header: Basics: if-a')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
      fireEvent.click(
        screen.getByRole('button', {name: 'Complete checkpoint'})
      );
      expect(onFinish).toHaveBeenCalledTimes(1);
    });
  });

  describe('with a review step', () => {
    const planned: Checkpoint = {
      ...checkpoint,
      plan: {template: 'A site that is {feel}.'},
      steps: [
        {
          id: 'ask',
          title: 'Ask',
          kind: 'questions',
          questions: [
            {
              id: 1,
              type: 'MultipleChoiceQuestion',
              questionName: 'feel',
              questionTitle: 'How should it feel?',
              choices: [
                {id: 'a', text: 'Calm'},
                {id: 'b', text: 'Bold'},
              ],
              plan: 'feel',
            },
          ],
        },
        {id: 'review', title: 'Review', kind: 'review', questionId: 2},
        placeholder('between'),
        {
          id: 'starter',
          title: 'Starter',
          kind: 'level',
          level: 'starter',
          project: true,
          projectPrompt: 'A first version.',
        },
      ],
    };
    const answered: Progress = {
      steps: {ask: {timeSpent: 0, answers: {1: [{answerId: 'b'}]}}},
    };

    const renderReview = () => {
      const calls: unknown[][] = [];
      const Host = () => {
        const [progress, setProgress] = useState(answered);
        const [buildRequested, setBuildRequested] = useState(false);
        return (
          <PathwayContext.Provider
            value={
              {
                progress,
                checkpoint: planned,
                buildRequested,
                setBuildRequested,
              } as unknown as PathwayContextValue
            }
          >
            <StepPlayer
              checkpoint={planned}
              initialStepId="review"
              onStartStep={jest.fn()}
              onCompleteStep={jest.fn()}
              onLeaveStep={jest.fn()}
              onSaveAnswers={(step, questionId, list) => {
                calls.push([step.id, questionId, list]);
                setProgress(p => ({
                  steps: {
                    ...p.steps,
                    [step.id]: {
                      timeSpent: 0,
                      answers: {
                        ...p.steps[step.id]?.answers,
                        [questionId]: list,
                      },
                    },
                  },
                }));
              }}
              onExit={jest.fn()}
              onFinish={jest.fn()}
            />
          </PathwayContext.Provider>
        );
      };
      render(<Host />);
      return {calls};
    };

    it('shows the plan filled from the answers', () => {
      renderReview();
      expect(screen.getByText('A site that is', {exact: false})).toBeTruthy();
      expect(screen.getByText('Bold', {selector: 'strong'})).toBeTruthy();
    });

    it('saves a build decision and asks the next project step to build', () => {
      const {calls} = renderReview();
      fireEvent.click(screen.getByRole('button', {name: 'Build site'}));
      expect(calls).toEqual([['review', 2, [{answerId: 'build'}]]]);
      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
      expect(screen.getByText('level: starter build: true')).toBeTruthy();
    });

    it('saves a skip and loads the project step as it is', () => {
      const {calls} = renderReview();
      fireEvent.click(screen.getByRole('button', {name: 'Skip'}));
      expect(calls).toEqual([['review', 2, [{answerId: 'skip'}]]]);
      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
      expect(screen.getByText('level: starter build: false')).toBeTruthy();
    });

    it('drops the build when the student goes back before the project step', () => {
      renderReview();
      fireEvent.click(screen.getByRole('button', {name: 'Build site'}));
      window.history.replaceState({}, '', '?checkpoint=basics&step=review');
      act(() => window.dispatchEvent(new PopStateEvent('popstate')));
      fireEvent.click(screen.getByRole('button', {name: 'Skip'}));
      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
      expect(screen.getByText('level: starter build: false')).toBeTruthy();
    });
  });
});
