import {act, render, screen} from '@testing-library/react';
import React from 'react';

import {EMPTY_PROGRESS, Progress} from '@cdo/apps/adaptive/progress';
import {Pathway} from '@cdo/apps/adaptive/types';
import PathwayApp from '@cdo/apps/adaptive/views/PathwayApp';

jest.mock('@cdo/apps/adaptive/views/MapScreen', () => ({
  __esModule: true,
  default: ({onWorkOnProject}: {onWorkOnProject: () => void}) => (
    <button type="button" onClick={onWorkOnProject}>
      map screen
    </button>
  ),
}));
jest.mock('@cdo/apps/adaptive/views/steps/StepPlayer', () => ({
  __esModule: true,
  default: ({checkpoint}: {checkpoint: {title: string}}) => (
    <div>playing {checkpoint.title}</div>
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
});
