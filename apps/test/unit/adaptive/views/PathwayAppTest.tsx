import {act, render, screen} from '@testing-library/react';
import React from 'react';

import {EMPTY_PROGRESS, Progress} from '@cdo/apps/adaptive/progress';
import {Pathway} from '@cdo/apps/adaptive/types';
import PathwayApp from '@cdo/apps/adaptive/views/PathwayApp';

jest.mock('@cdo/apps/adaptive/views/MapScreen', () => ({
  __esModule: true,
  default: ({
    onStart,
    focusId,
    onWorkOnProject,
  }: {
    onStart: (id: string) => void;
    focusId?: string;
    onWorkOnProject: () => void;
  }) => (
    <>
      <button type="button" onClick={() => onStart('intro')}>
        start intro
      </button>
      <button type="button" onClick={() => onStart('multi')}>
        start multi
      </button>
      <button type="button" onClick={onWorkOnProject}>
        map screen{focusId ? ` focused on ${focusId}` : ''}
      </button>
    </>
  ),
}));
jest.mock('@cdo/apps/adaptive/views/AdaptiveHeader', () => ({
  __esModule: true,
  default: ({title, onFinish}: {title: string; onFinish?: () => void}) => (
    <div>
      header: {title}
      {onFinish && (
        <button type="button" onClick={onFinish}>
          I'm finished!
        </button>
      )}
    </div>
  ),
}));
jest.mock('@cdo/apps/adaptive/views/steps/StepPlayer', () => ({
  __esModule: true,
  // Finishing completes the last step first, as the real player does.
  default: ({
    checkpoint,
    initialStepId,
    onCompleteStep,
    onExit,
    onFinish,
    onFinishPathway,
  }: {
    checkpoint: {title: string; steps: unknown[]};
    initialStepId?: string;
    onCompleteStep: (step: unknown, timeMs: number) => void;
    onExit: () => void;
    onFinish: () => void;
    onFinishPathway?: () => void;
  }) => (
    <div>
      playing {checkpoint.title}
      {initialStepId ? ` at ${initialStepId}` : ''}
      <button type="button" onClick={onExit}>
        exit
      </button>
      <button
        type="button"
        onClick={() => {
          onCompleteStep(checkpoint.steps[checkpoint.steps.length - 1], 0);
          onFinish();
        }}
      >
        finish
      </button>
      {onFinishPathway && (
        <button type="button" onClick={onFinishPathway}>
          finish pathway
        </button>
      )}
    </div>
  ),
}));
jest.mock('@cdo/apps/lab2/views/Loading', () => ({
  __esModule: true,
  default: () => <div>loading</div>,
}));
jest.mock('@cdo/apps/aichat/api/shouldUseAiGateway', () => ({
  setAiGatewayOptIn: jest.fn(),
}));
jest.mock('@cdo/apps/adaptive/ai/generate', () => ({
  isAdaptiveAiEnabled: () => false,
}));
const mockDispatch = jest.fn();
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  ...jest.requireActual('@cdo/apps/util/reduxHooks'),
  useAppDispatch: () => mockDispatch,
}));
jest.mock('@cdo/apps/code-studio/progressRedux', () => ({
  sendAdaptiveStepReport: jest.fn(),
  sendStartedReportIfNotStarted: (app: string) => ({startedReport: app}),
}));
const mockLoad = jest.fn<Promise<Progress>, []>();
jest.mock('@cdo/apps/adaptive/progress/progressStore', () => ({
  serverProgressStore: {
    load: () => mockLoad(),
    saveStep: jest.fn(),
    saveInstructions: jest.fn(),
  },
}));

const step = (id: string) => ({
  id: `${id}-step`,
  title: id,
  kind: 'panels' as const,
  panels: [{key: `${id}-1`, imageUrl: 'x.png', text: id}],
});
const pathway: Pathway = {
  formatVersion: 4,
  id: 'p',
  title: 'Pathway',
  objective: 'Learn.',
  project: {templateLevel: 'tmpl', description: 'A site.'},
  skills: {},
  checkpoints: [
    {
      id: 'intro',
      title: 'Intro',
      description: 'Start here.',
      steps: [step('intro')],
    },
    {
      id: 'next',
      title: 'Next',
      description: 'Then this.',
      requires: ['intro'],
      steps: [step('next')],
    },
    {
      id: 'multi',
      title: 'Multi',
      description: 'Two steps.',
      steps: [step('multi-a'), step('multi-b')],
    },
  ],
};
const progressKey = {scriptId: 2, levelId: 3};

describe('PathwayApp', () => {
  const originalUrl = window.location.href;

  beforeEach(() => {
    mockDispatch.mockClear();
    mockLoad.mockResolvedValue(EMPTY_PROGRESS);
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    window.history.replaceState({}, '', originalUrl);
  });

  // Progress loads from a promise, so the first render settles after a tick.
  const renderSettled = async () => {
    await act(async () => {
      render(<PathwayApp pathway={pathway} progressKey={progressKey} />);
    });
    await act(async () => {
      await Promise.resolve();
    });
  };

  it('auto-starts the first checkpoint at the first step when there is no progress', async () => {
    await renderSettled();

    expect(screen.getByText('playing Intro at intro-step')).toBeTruthy();
    expect(mockDispatch).toHaveBeenCalledWith({startedReport: 'adaptive'});
  });

  it('auto-starts even when the only entry holds generated instructions', async () => {
    mockLoad.mockResolvedValue({
      steps: {
        'intro-step': {
          timeSpent: 0,
          generatedInstructions: {instructions: 'Hi', inputsHash: 'ab'},
        },
      },
    });

    await renderSettled();

    expect(screen.getByText(/playing Intro/)).toBeTruthy();
  });

  it('shows the map once anything has been started', async () => {
    mockLoad.mockResolvedValue({
      steps: {'intro-step': {status: 'started', timeSpent: 0}},
    });

    await renderSettled();

    expect(screen.getByText('map screen')).toBeTruthy();
    expect(mockDispatch).not.toHaveBeenCalled();

    act(() => screen.getByText('map screen').click());
    expect(mockDispatch).toHaveBeenCalledWith({startedReport: 'adaptive'});
  });

  it('resumes at the first incomplete step when opening an in-progress checkpoint', async () => {
    mockLoad.mockResolvedValue({
      steps: {
        'intro-step': {status: 'complete', timeSpent: 0},
        'multi-a-step': {status: 'complete', timeSpent: 0},
      },
    });

    await renderSettled();

    // Has progress → map shown first.
    expect(screen.getByText('map screen')).toBeTruthy();

    act(() => screen.getByText('start multi').click());

    expect(screen.getByText('playing Multi at multi-b-step')).toBeTruthy();
  });

  describe('URL parameters', () => {
    it('opens a URL-specified checkpoint even when there is existing progress', async () => {
      // intro complete → next is available (not locked).
      mockLoad.mockResolvedValue({
        steps: {'intro-step': {status: 'complete', timeSpent: 0}},
      });
      window.history.replaceState({}, '', '?checkpoint=next');

      await renderSettled();

      // No step in URL → stepIdToResume picks the first incomplete step.
      expect(screen.getByText('playing Next at next-step')).toBeTruthy();
    });

    it('passes the URL step id to StepPlayer', async () => {
      window.history.replaceState({}, '', '?checkpoint=intro&step=intro-step');

      await renderSettled();

      expect(screen.getByText('playing Intro at intro-step')).toBeTruthy();
    });

    it('falls back to stepIdToResume when the URL step does not belong to the checkpoint', async () => {
      window.history.replaceState({}, '', '?checkpoint=intro&step=bogus-step');

      await renderSettled();

      // 'bogus-step' is not in intro's steps → stepIdToResume → first incomplete step.
      expect(screen.getByText('playing Intro at intro-step')).toBeTruthy();
    });

    it('falls back to stepIdToResume when a popstate URL step does not belong to the checkpoint', async () => {
      mockLoad.mockResolvedValue({
        steps: {'intro-step': {status: 'started', timeSpent: 0}},
      });
      await renderSettled();

      window.history.replaceState({}, '', '?checkpoint=intro&step=bogus-step');
      act(() => window.dispatchEvent(new PopStateEvent('popstate')));

      // 'bogus-step' not in intro → stepIdToResume → 'intro-step' (started, not complete).
      expect(screen.getByText('playing Intro at intro-step')).toBeTruthy();
    });

    it('clears URL params when the user exits a checkpoint back to the map', async () => {
      window.history.replaceState({}, '', '?checkpoint=intro&step=intro-step');

      await renderSettled();
      act(() => screen.getByRole('button', {name: 'exit'}).click());

      expect(window.location.search).toBe('');
    });

    it('clears URL params when the user finishes a checkpoint', async () => {
      window.history.replaceState({}, '', '?checkpoint=intro&step=intro-step');

      await renderSettled();
      act(() => screen.getByRole('button', {name: 'finish'}).click());

      expect(window.location.search).toBe('');
    });

    it('uses progress resume rather than the URL step when a different checkpoint is opened', async () => {
      mockLoad.mockResolvedValue({
        steps: {'multi-a-step': {status: 'complete', timeSpent: 0}},
      });
      // URL targets intro; multi is a different checkpoint with progress.
      window.history.replaceState({}, '', '?checkpoint=intro&step=intro-step');

      await renderSettled();

      // Exit intro back to the map, then open multi.
      act(() => screen.getByRole('button', {name: 'exit'}).click());
      act(() => screen.getByText('start multi').click());

      // multi should resume at multi-b-step (from progress), not intro-step.
      expect(screen.getByText('playing Multi at multi-b-step')).toBeTruthy();
    });

    it('ignores a URL checkpoint that is locked and shows the map', async () => {
      // 'next' requires 'intro' to be complete; with no progress it is locked.
      window.history.replaceState({}, '', '?checkpoint=next&step=next-step');

      await renderSettled();

      expect(screen.getByText('map screen')).toBeTruthy();
      expect(window.location.search).toBe('');
    });

    it('ignores a popstate navigation to a locked checkpoint and stays on the map', async () => {
      mockLoad.mockResolvedValue({
        steps: {'intro-step': {status: 'started', timeSpent: 0}},
      });
      await renderSettled();
      expect(screen.getByText('map screen')).toBeTruthy();

      // 'next' requires intro to be complete; started is not complete → locked.
      window.history.replaceState({}, '', '?checkpoint=next&step=next-step');
      act(() => window.dispatchEvent(new PopStateEvent('popstate')));

      expect(screen.getByText('map screen')).toBeTruthy();
      expect(window.location.search).toBe('');
    });

    it('navigates back to the map when the browser fires popstate with no checkpoint', async () => {
      window.history.replaceState({}, '', '?checkpoint=intro&step=intro-step');
      await renderSettled();
      expect(screen.getByText(/playing Intro/)).toBeTruthy();

      // Simulate browser back to the map (no checkpoint param).
      window.history.replaceState({}, '', '/');
      act(() => window.dispatchEvent(new PopStateEvent('popstate')));

      expect(screen.getByText('map screen')).toBeTruthy();
    });

    it('navigates into a checkpoint when the browser fires popstate with a checkpoint param', async () => {
      mockLoad.mockResolvedValue({
        steps: {'intro-step': {status: 'started', timeSpent: 0}},
      });
      await renderSettled();
      expect(screen.getByText('map screen')).toBeTruthy();

      // Simulate browser forward to intro at a specific step.
      window.history.replaceState({}, '', '?checkpoint=intro&step=intro-step');
      act(() => window.dispatchEvent(new PopStateEvent('popstate')));

      expect(screen.getByText('playing Intro at intro-step')).toBeTruthy();
    });
  });

  // A diagnostic whose one survey answer shows build at evidence level 1,
  // enough to skip the first-ring checkpoint, with the one past it open.
  const routing: Pathway = {
    ...pathway,
    skills: {
      build: {id: 'build', title: 'Build', description: 'Build.'},
    },
    checkpoints: [
      {
        id: 'intro',
        title: 'Intro',
        description: 'Start here.',
        routeAfterCompletion: true,
        steps: [
          {
            id: 'intro-check',
            title: 'Check',
            kind: 'questions',
            questions: [
              {
                id: 1,
                type: 'MultipleChoiceQuestion',
                questionName: 'q1',
                questionTitle: 'Q1',
                choices: [
                  {id: 'a', text: 'A'},
                  {id: 'b', text: 'B'},
                ],
                measures: {skillId: 'build', evidenceLevels: {a: 0, b: 1}},
              },
            ],
          },
        ],
      },
      {
        id: 'next',
        title: 'Next',
        description: 'Then this.',
        skillIds: ['build'],
        skippable: true,
        requires: ['intro'],
        steps: [step('next')],
      },
      {
        id: 'after',
        title: 'After',
        description: 'And this.',
        requires: ['next'],
        steps: [step('after')],
      },
    ],
  };

  it('shows the map focused past a skipped checkpoint when a routing checkpoint finishes', async () => {
    // Answers but no status, so the intro auto-opens and its finish routes.
    mockLoad.mockResolvedValue({
      steps: {
        'intro-check': {timeSpent: 1, answers: {1: [{answerId: 'b'}]}},
      },
    });
    await act(async () => {
      render(<PathwayApp pathway={routing} progressKey={progressKey} />);
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText(/playing Intro/)).toBeTruthy();

    await act(async () => {
      screen.getByText('finish').click();
    });

    expect(screen.getByText('map screen focused on after')).toBeTruthy();
  });

  it('returns to the map unfocused after a checkpoint that does not route', async () => {
    await act(async () => {
      render(<PathwayApp pathway={pathway} progressKey={progressKey} />);
    });
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      screen.getByText('finish').click();
    });

    expect(screen.getByText('map screen')).toBeTruthy();
  });

  it("opens the project from the map header's I'm finished", async () => {
    mockLoad.mockResolvedValue({
      steps: {'intro-step': {status: 'started', timeSpent: 0}},
    });
    await renderSettled();
    expect(screen.getByText('header: Skill Tree: Pathway')).toBeTruthy();

    act(() => screen.getByText("I'm finished!").click());

    expect(screen.getByText('playing My Project')).toBeTruthy();
    expect(mockDispatch).toHaveBeenCalledWith({startedReport: 'adaptive'});
  });

  it('opens the project when a checkpoint is left for it', async () => {
    await renderSettled();
    expect(screen.getByText(/playing Intro/)).toBeTruthy();

    act(() => screen.getByText('finish pathway').click());

    expect(screen.getByText('playing My Project')).toBeTruthy();
    expect(screen.queryByText('finish pathway')).toBeNull();
  });
});
