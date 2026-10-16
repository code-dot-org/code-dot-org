import {EMPTY_PROGRESS, Progress} from '@cdo/apps/adaptive/progress';
import {PathwayEvidence} from '@cdo/apps/adaptive/routing/evidence';
import {route} from '@cdo/apps/adaptive/routing/route';
import {Checkpoint, Pathway} from '@cdo/apps/adaptive/types';

const checkpoint = (
  id: string,
  rest: Partial<Checkpoint> = {}
): Checkpoint => ({
  id,
  title: id,
  description: id,
  steps: [
    {
      id: `${id}-step`,
      title: id,
      kind: 'panels',
      panels: [{key: `${id}-1`, imageUrl: 'x.png', text: id}],
    },
  ],
  ...rest,
});

// The sample's shape: an intro, three first-ring build checkpoints with
// rising targets, one language checkpoint behind two of them, and one
// build checkpoint that is not skippable.
const pathway = {
  checkpoints: [
    checkpoint('intro'),
    checkpoint('add-details', {
      skillIds: ['build'],
      requires: ['intro'],
      skippable: true,
      targetEvidenceLevels: {build: 1},
    }),
    checkpoint('tweak-it', {
      skillIds: ['build'],
      requires: ['intro'],
      skippable: true,
      targetEvidenceLevels: {build: 2},
    }),
    checkpoint('edit-by-hand', {
      skillIds: ['build'],
      requires: ['intro'],
      targetEvidenceLevels: {build: 2},
    }),
    checkpoint('spot-section', {
      skillIds: ['language'],
      requires: ['add-details', 'tweak-it'],
      skippable: true,
    }),
  ],
} as unknown as Pathway;

const evidenceOf = (levels: {[skillId: string]: number}): PathwayEvidence =>
  Object.fromEntries(
    Object.entries(levels).map(([skillId, evidenceLevel]) => [
      skillId,
      {skillId, evidenceLevel, source: 'questions' as const, from: []},
    ])
  );

const afterIntro: Progress = {
  ...EMPTY_PROGRESS,
  completed: ['intro'],
  started: ['intro'],
};
const introDone = {kind: 'checkpointComplete' as const, checkpointId: 'intro'};

describe('route', () => {
  it('places at the first available checkpoint when nothing is demonstrated', () => {
    const result = route(pathway, afterIntro, {}, introDone);
    expect(result.completedCheckpoints).toEqual([]);
    expect(result.nextCheckpoint).toBe('add-details');
  });

  it('passes a demonstrated skippable checkpoint and places at the next', () => {
    const result = route(
      pathway,
      afterIntro,
      evidenceOf({build: 1}),
      introDone
    );
    expect(result.completedCheckpoints).toEqual(['add-details']);
    expect(result.nextCheckpoint).toBe('tweak-it');
  });

  it('keeps passing as completions open more, but never a non-skippable one', () => {
    const result = route(
      pathway,
      afterIntro,
      evidenceOf({build: 2, language: 1}),
      introDone
    );
    expect(result.completedCheckpoints).toEqual([
      'add-details',
      'tweak-it',
      'spot-section',
    ]);
    expect(result.nextCheckpoint).toBe('edit-by-hand');
  });

  it('does not pass a checkpoint whose skills lack evidence', () => {
    const result = route(
      pathway,
      afterIntro,
      evidenceOf({build: 2}),
      introDone
    );
    expect(result.completedCheckpoints).toEqual(['add-details', 'tweak-it']);
    expect(result.nextCheckpoint).toBe('edit-by-hand');
  });

  it('never passes a checkpoint in progress, and places there first', () => {
    const progress: Progress = {
      ...afterIntro,
      started: ['intro', 'tweak-it'],
    };
    const result = route(
      pathway,
      progress,
      evidenceOf({build: 2, language: 1}),
      introDone
    );
    expect(result.completedCheckpoints).toEqual(['add-details']);
    expect(result.nextCheckpoint).toBe('tweak-it');
  });

  it('places nowhere when everything open is passed or done', () => {
    const progress: Progress = {
      ...afterIntro,
      completed: ['intro', 'edit-by-hand'],
    };
    const result = route(
      pathway,
      progress,
      evidenceOf({build: 2, language: 1}),
      introDone
    );
    expect(result.completedCheckpoints).toEqual([
      'add-details',
      'tweak-it',
      'spot-section',
    ]);
    expect(result.nextCheckpoint).toBeUndefined();
  });

  it('does not change the progress it was given', () => {
    const progress = {...afterIntro, completed: [...afterIntro.completed]};
    route(pathway, progress, evidenceOf({build: 2}), introDone);
    expect(progress.completed).toEqual(['intro']);
  });
});
