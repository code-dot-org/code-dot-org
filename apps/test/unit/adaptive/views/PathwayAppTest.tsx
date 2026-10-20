import {act, render, screen} from '@testing-library/react';
import React from 'react';

import {EMPTY_PROGRESS, Progress} from '@cdo/apps/adaptive/progress';
import {Pathway} from '@cdo/apps/adaptive/types';
import PathwayApp from '@cdo/apps/adaptive/views/PathwayApp';

jest.mock('@cdo/apps/adaptive/views/MapScreen', () => ({
  __esModule: true,
  default: ({
    onStart,
    onWorkOnProject,
  }: {
    onStart: (id: string) => void;
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
        map screen
      </button>
    </>
  ),
}));
jest.mock('@cdo/apps/adaptive/views/steps/StepPlayer', () => ({
  __esModule: true,
  default: ({
    checkpoint,
    initialStepId,
    onExit,
    onFinish,
  }: {
    checkpoint: {title: string};
    initialStepId?: string;
    onExit: () => void;
    onFinish: () => void;
  }) => (
    <div>
      playing {checkpoint.title}
      {initialStepId ? ` at ${initialStepId}` : ''}
      <button type="button" onClick={onExit}>
        exit
      </button>
      <button type="button" onClick={onFinish}>
        finish
      </button>
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
  },
  localGeneratedInstructionsStore: {
    load: () => Promise.resolve(undefined),
    save: () => Promise.resolve(),
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

  it('shows the map for a student with no progress', async () => {
    await renderSettled();

    expect(screen.getByText('map screen')).toBeTruthy();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('shows the map when the student has existing progress', async () => {
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
      mockLoad.mockResolvedValue({
        steps: {'intro-step': {status: 'started', timeSpent: 0}},
      });
      window.history.replaceState({}, '', '?checkpoint=next');

      await renderSettled();

      // No step in URL → resumeStepId picks the first incomplete step.
      expect(screen.getByText('playing Next at next-step')).toBeTruthy();
    });

    it('passes the URL step id to StepPlayer', async () => {
      window.history.replaceState({}, '', '?checkpoint=intro&step=intro-step');

      await renderSettled();

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
  });
});
