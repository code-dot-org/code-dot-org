import {act, render, screen} from '@testing-library/react';
import React from 'react';

import {EMPTY_PROGRESS, Progress} from '@cdo/apps/adaptive/progress';
import {Pathway} from '@cdo/apps/adaptive/types';
import PathwayApp from '@cdo/apps/adaptive/views/PathwayApp';

jest.mock('@cdo/apps/adaptive/views/MapScreen', () => ({
  __esModule: true,
  default: ({
    focusId,
    onWorkOnProject,
  }: {
    focusId?: string;
    onWorkOnProject: () => void;
  }) => (
    <button type="button" onClick={onWorkOnProject}>
      map screen{focusId ? ` focused on ${focusId}` : ''}
    </button>
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
    onCompleteStep,
    onFinish,
    onFinishPathway,
  }: {
    checkpoint: {title: string; steps: unknown[]};
    onCompleteStep: (step: unknown, timeMs: number) => void;
    onFinish: () => void;
    onFinishPathway?: () => void;
  }) => (
    <div>
      playing {checkpoint.title}
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
  ],
};
const progressKey = {scriptId: 2, levelId: 3};

describe('PathwayApp', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockLoad.mockResolvedValue(EMPTY_PROGRESS);
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

  it('opens the first checkpoint for a student with no progress', async () => {
    await renderSettled();

    expect(screen.getByText('playing Intro')).toBeTruthy();
    expect(mockDispatch).toHaveBeenCalledWith({startedReport: 'adaptive'});
  });

  it('opens the first checkpoint when the only entry holds generated instructions', async () => {
    mockLoad.mockResolvedValue({
      steps: {
        'intro-step': {
          timeSpent: 0,
          generatedInstructions: {instructions: 'Hi', inputsHash: 'ab'},
        },
      },
    });

    await renderSettled();

    expect(screen.getByText('playing Intro')).toBeTruthy();
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
    expect(screen.getByText('playing Intro')).toBeTruthy();

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
    expect(screen.getByText('playing Intro')).toBeTruthy();

    act(() => screen.getByText('finish pathway').click());

    expect(screen.getByText('playing My Project')).toBeTruthy();
    expect(screen.queryByText('finish pathway')).toBeNull();
  });
});
