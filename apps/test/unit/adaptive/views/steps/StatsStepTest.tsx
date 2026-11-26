import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import {serverProgressStore} from '@cdo/apps/adaptive/progress/progressStore';
import {Pathway, StatsStep as StatsStepContent} from '@cdo/apps/adaptive/types';
import {
  PathwayContext,
  PathwayContextValue,
} from '@cdo/apps/adaptive/views/PathwayContext';
import StatsStep from '@cdo/apps/adaptive/views/steps/StatsStep';

const pathway = {
  project: {templateLevel: 'tmpl', description: 'A site.'},
  skills: {build: {id: 'build', title: 'Build', description: 'B.'}},
  destinations: {north: {title: 'North', icon: 'wrench', color: 'orange'}},
  checkpoints: [
    {id: 'a', skillIds: ['build'], steps: []},
    {id: 'n1', destination: 'north', skillIds: ['build'], steps: []},
    {id: 'n2', destination: 'north', steps: []},
  ],
} as unknown as Pathway;

const step: StatsStepContent = {
  id: 'finish-stats',
  title: 'Great job!',
  kind: 'stats',
  heading: 'Great job!',
  subheading: 'Keep it up.',
};

const progressKey = {scriptId: 11, levelId: 98263};

describe('StatsStep', () => {
  let loadAiMetrics: jest.SpyInstance;
  beforeEach(() => {
    loadAiMetrics = jest
      .spyOn(serverProgressStore, 'loadAiMetrics')
      .mockResolvedValue({accepted: 4, rejected: 1});
  });
  afterEach(() => loadAiMetrics.mockRestore());

  it('shows the count, the AI changes, the skills and destinations, then continues', async () => {
    const onComplete = jest.fn();
    render(
      <PathwayContext.Provider
        value={
          {
            pathway,
            progressKey,
            statusMap: {a: 'complete', n1: 'complete', n2: 'available'},
            progress: {steps: {}},
          } as unknown as PathwayContextValue
        }
      >
        <StatsStep
          step={step}
          continueLabel="Continue"
          onComplete={onComplete}
        />
      </PathwayContext.Provider>
    );
    expect(screen.getByRole('heading', {name: 'Great job!'})).toBeTruthy();
    expect(screen.getByText('Keep it up.')).toBeTruthy();
    expect(await screen.findByText('4')).toBeTruthy();
    expect(loadAiMetrics).toHaveBeenCalledWith(progressKey, undefined);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(
      screen.getByLabelText('North: 1 of 2 checkpoints complete')
    ).toBeTruthy();
    expect(
      screen.getByLabelText('Build: 2 of 2 checkpoints complete')
    ).toBeTruthy();
    expect(screen.getAllByRole('term').map(term => term.textContent)).toEqual([
      'Checkpoints completed',
      'AI changes accepted',
      'AI changes rejected',
      'Skill mastery',
      'Focus areas',
    ]);
    expect(document.querySelector('img')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows the logo the step names above the heading', () => {
    render(
      <PathwayContext.Provider
        value={
          {
            pathway,
            progressKey,
            statusMap: {a: 'complete'},
            progress: {steps: {}},
          } as unknown as PathwayContextValue
        }
      >
        <StatsStep
          step={{...step, logoUrl: 'https://images.code.org/logo.svg'}}
          continueLabel="Continue"
          onComplete={jest.fn()}
        />
      </PathwayContext.Provider>
    );
    const logo = document.querySelector('img');
    expect(logo?.getAttribute('src')).toBe('https://images.code.org/logo.svg');
    expect(logo?.getAttribute('alt')).toBe('');
  });

  it("loads the viewed student's AI changes for a teacher", async () => {
    render(
      <PathwayContext.Provider
        value={
          {
            pathway,
            progressKey,
            statusMap: {a: 'complete'},
            progress: {steps: {}},
            viewAsUserId: 77,
          } as unknown as PathwayContextValue
        }
      >
        <StatsStep
          step={step}
          continueLabel="Continue"
          onComplete={jest.fn()}
        />
      </PathwayContext.Provider>
    );
    expect(await screen.findByText('4')).toBeTruthy();
    expect(loadAiMetrics).toHaveBeenCalledWith(progressKey, 77);
  });

  it('leaves out the AI changes while they load and when they fail to', async () => {
    loadAiMetrics.mockResolvedValue(undefined);
    render(
      <PathwayContext.Provider
        value={
          {
            pathway,
            progressKey,
            statusMap: {a: 'complete'},
            progress: {steps: {}},
          } as unknown as PathwayContextValue
        }
      >
        <StatsStep
          step={step}
          continueLabel="Continue"
          onComplete={jest.fn()}
        />
      </PathwayContext.Provider>
    );
    expect(screen.queryByText('AI changes accepted')).toBeNull();
    await waitFor(() => expect(loadAiMetrics).toHaveBeenCalled());
    expect(screen.queryByText('AI changes accepted')).toBeNull();
    expect(screen.queryByText('AI changes rejected')).toBeNull();
    expect(screen.getByText('Checkpoints completed')).toBeTruthy();
  });

  it('shows only the figures the step names, in its order', async () => {
    render(
      <PathwayContext.Provider
        value={
          {
            pathway,
            progressKey,
            statusMap: {a: 'complete'},
            progress: {steps: {}},
          } as unknown as PathwayContextValue
        }
      >
        <StatsStep
          step={{
            ...step,
            stats: ['aiChangesRejected', 'checkpoints'],
          }}
          continueLabel="Continue"
          onComplete={jest.fn()}
        />
      </PathwayContext.Provider>
    );
    await screen.findByText('AI changes rejected');
    expect(screen.getAllByRole('term').map(term => term.textContent)).toEqual([
      'AI changes rejected',
      'Checkpoints completed',
    ]);
    expect(screen.queryByLabelText(/North/)).toBeNull();
  });
});
