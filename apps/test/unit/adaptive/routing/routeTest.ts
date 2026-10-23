import {Progress} from '@cdo/apps/adaptive/progress';
import {PathwayEvidence} from '@cdo/apps/adaptive/routing/evidence';
import {nextCheckpoint, routeStatusMap} from '@cdo/apps/adaptive/routing/route';
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

/** Progress with each listed checkpoint's one step complete or started. */
const progressOf = (completed: string[], started: string[] = []): Progress => ({
  steps: {
    ...Object.fromEntries(
      started.map(id => [`${id}-step`, {status: 'started', timeSpent: 0}])
    ),
    ...Object.fromEntries(
      completed.map(id => [`${id}-step`, {status: 'complete', timeSpent: 0}])
    ),
  },
});

describe('routeStatusMap', () => {
  it('skips nothing without evidence', () => {
    expect(routeStatusMap(pathway, progressOf(['intro']), {})).toEqual({
      intro: 'complete',
      'add-details': 'available',
      'tweak-it': 'available',
      'edit-by-hand': 'available',
      'spot-section': 'locked',
    });
  });

  it('skips a demonstrated skippable checkpoint', () => {
    const statusMap = routeStatusMap(
      pathway,
      progressOf(['intro']),
      evidenceOf({build: 1})
    );
    expect(statusMap['add-details']).toBe('skipped');
    expect(statusMap['tweak-it']).toBe('available');
  });

  it('keeps skipping as skips unlock more, but never a non-skippable one', () => {
    const statusMap = routeStatusMap(
      pathway,
      progressOf(['intro']),
      evidenceOf({build: 2, language: 1})
    );
    expect(statusMap).toEqual({
      intro: 'complete',
      'add-details': 'skipped',
      'tweak-it': 'skipped',
      'edit-by-hand': 'available',
      'spot-section': 'skipped',
    });
  });

  it('does not skip a checkpoint whose skills lack evidence', () => {
    const statusMap = routeStatusMap(
      pathway,
      progressOf(['intro']),
      evidenceOf({build: 2})
    );
    expect(statusMap['spot-section']).toBe('available');
  });

  it('never skips a checkpoint the student has started', () => {
    const statusMap = routeStatusMap(
      pathway,
      progressOf(['intro'], ['tweak-it']),
      evidenceOf({build: 2, language: 1})
    );
    expect(statusMap['tweak-it']).toBe('inProgress');
    expect(statusMap['add-details']).toBe('skipped');
    // Nothing skipped tweak-it, so spot-section stays behind it.
    expect(statusMap['spot-section']).toBe('locked');
  });

  it('does not skip a locked checkpoint, whatever the evidence', () => {
    const statusMap = routeStatusMap(
      pathway,
      progressOf([]),
      evidenceOf({build: 2, language: 1})
    );
    expect(statusMap).toEqual({
      intro: 'available',
      'add-details': 'locked',
      'tweak-it': 'locked',
      'edit-by-hand': 'locked',
      'spot-section': 'locked',
    });
  });

  it('keeps everything a completed checkpoint requires done, even once the evidence no longer covers it', () => {
    // Spot the Section was completed after add-details and tweak-it were
    // skipped; a raised target then leaves tweak-it undemonstrated.
    const statusMap = routeStatusMap(
      pathway,
      progressOf(['intro', 'spot-section']),
      evidenceOf({build: 1})
    );
    expect(statusMap).toEqual({
      intro: 'complete',
      'add-details': 'skipped',
      'tweak-it': 'available',
      'edit-by-hand': 'available',
      'spot-section': 'complete',
    });
  });
});

describe('nextCheckpoint', () => {
  it('is the first checkpoint in progress or available, in authored order', () => {
    expect(
      nextCheckpoint(pathway, {
        intro: 'complete',
        'add-details': 'skipped',
        'tweak-it': 'available',
        'edit-by-hand': 'inProgress',
        'spot-section': 'locked',
      })
    ).toBe('tweak-it');
    expect(
      nextCheckpoint(pathway, {
        intro: 'complete',
        'add-details': 'skipped',
        'tweak-it': 'skipped',
        'edit-by-hand': 'complete',
        'spot-section': 'skipped',
      })
    ).toBeUndefined();
  });
});
