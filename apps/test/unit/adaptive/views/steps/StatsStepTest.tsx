import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

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

describe('StatsStep', () => {
  it('shows the count, the destinations and the time, then continues', () => {
    const onComplete = jest.fn();
    render(
      <PathwayContext.Provider
        value={
          {
            pathway,
            statusMap: {a: 'complete', n1: 'complete', n2: 'available'},
            progress: {
              steps: {
                s1: {timeSpent: 3700, status: 'complete'},
                s2: {timeSpent: 20, status: 'started'},
              },
            },
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
    expect(screen.getByText('2')).toBeTruthy();
    expect(
      screen.getByLabelText('North: 1 of 2 checkpoints complete')
    ).toBeTruthy();
    expect(
      screen.getByLabelText('Build: 2 of 2 checkpoints complete')
    ).toBeTruthy();
    expect(screen.getByText('1h02m')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows only the figures the step names, in its order', () => {
    render(
      <PathwayContext.Provider
        value={
          {
            pathway,
            statusMap: {a: 'complete'},
            progress: {steps: {s1: {timeSpent: 60, status: 'complete'}}},
          } as unknown as PathwayContextValue
        }
      >
        <StatsStep
          step={{...step, stats: ['timeSpent', 'checkpoints']}}
          continueLabel="Continue"
          onComplete={jest.fn()}
        />
      </PathwayContext.Provider>
    );
    expect(screen.getAllByRole('term').map(term => term.textContent)).toEqual([
      'Time spent',
      'Checkpoints completed',
    ]);
    expect(screen.queryByLabelText(/North/)).toBeNull();
  });
});
