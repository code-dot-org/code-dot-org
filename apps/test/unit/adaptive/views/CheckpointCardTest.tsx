import {render, screen} from '@testing-library/react';
import React from 'react';

import {PathwayEvidence} from '@cdo/apps/adaptive/routing/evidence';
import {Checkpoint, Pathway} from '@cdo/apps/adaptive/types';
import CheckpointCard from '@cdo/apps/adaptive/views/CheckpointCard';

const step = (id: string) => ({
  id,
  title: id,
  kind: 'panels' as const,
  panels: [{key: `${id}-1`, imageUrl: 'x.png', text: id}],
});
const intro: Checkpoint = {
  id: 'intro',
  title: 'Introduction',
  description: 'Start here.',
  steps: [step('intro-check')],
};
const details: Checkpoint = {
  id: 'details',
  title: 'Add Details',
  description: 'Say more.',
  skillIds: ['build'],
  requires: ['intro'],
  skippable: true,
  steps: [step('details-1')],
};
const pathway = {
  skills: {
    build: {id: 'build', title: 'Build with AI', description: 'Build.'},
  },
  checkpoints: [intro, details],
} as unknown as Pathway;
const evidence: PathwayEvidence = {
  build: {
    skillId: 'build',
    evidenceLevel: 1,
    from: [{kind: 'questions', stepId: 'intro-check', questionId: 1}],
  },
};

describe('CheckpointCard', () => {
  it('explains a skipped checkpoint by skill and where it was shown, with a link', () => {
    const onSelectCheckpoint = jest.fn();
    render(
      <CheckpointCard
        pathway={pathway}
        checkpoint={details}
        status="skipped"
        statusMap={{intro: 'complete', details: 'skipped'}}
        evidence={evidence}
        onStart={jest.fn()}
        onSelectCheckpoint={onSelectCheckpoint}
      />
    );

    expect(
      screen.getByText(/Skipped! You already demonstrated an understanding of/)
        .textContent
    ).toBe(
      'Skipped! You already demonstrated an understanding of Build with AI in checkpoint Introduction.'
    );
    expect(screen.getByText('Open anyway')).toBeTruthy();
    // The first is the sentence's link; the Requires list has another.
    screen.getAllByRole('button', {name: 'Introduction'})[0].click();
    expect(onSelectCheckpoint).toHaveBeenCalledWith('intro');
  });

  it('gives the action button the tour id for non-locked statuses', () => {
    for (const status of [
      'available',
      'inProgress',
      'complete',
      'skipped',
    ] as const) {
      const {unmount} = render(
        <CheckpointCard
          pathway={pathway}
          checkpoint={intro}
          status={status}
          statusMap={{intro: status, details: 'locked'}}
          evidence={{}}
          onStart={jest.fn()}
          onSelectCheckpoint={jest.fn()}
        />
      );
      expect(
        document.getElementById('adaptive-checkpoint-card-start')
      ).not.toBeNull();
      unmount();
    }
  });

  it('renders no action button (and no tour id) when status is locked', () => {
    render(
      <CheckpointCard
        pathway={pathway}
        checkpoint={intro}
        status="locked"
        statusMap={{intro: 'locked', details: 'locked'}}
        evidence={{}}
        onStart={jest.fn()}
        onSelectCheckpoint={jest.fn()}
      />
    );
    expect(
      document.getElementById('adaptive-checkpoint-card-start')
    ).toBeNull();
  });

  it('ends the sentence after the skills when nothing has been shown', () => {
    render(
      <CheckpointCard
        pathway={pathway}
        checkpoint={details}
        status="skipped"
        statusMap={{intro: 'complete', details: 'skipped'}}
        evidence={{}}
        onStart={jest.fn()}
        onSelectCheckpoint={jest.fn()}
      />
    );

    expect(
      screen.getByText(/Skipped! You already demonstrated an understanding of/)
        .textContent
    ).toBe(
      'Skipped! You already demonstrated an understanding of Build with AI.'
    );
  });
});
