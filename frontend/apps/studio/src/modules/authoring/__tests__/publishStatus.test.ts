import {describe, expect, it} from 'vitest';

import type {CurriculumChange} from '@code-dot-org/authoring';

import {countNewObjects, derivePublishStatus} from '../publishStatus';

const stamp = {seq: 1, at: '2026-08-27T00:00:00.000Z', actor: 'author'} as const;

describe('derivePublishStatus', () => {
  it('is draft when publish has never run', () => {
    expect(derivePublishStatus(0, undefined)).toBe('draft');
    expect(derivePublishStatus(5, undefined)).toBe('draft');
  });

  it('is published when the log has not grown since the last publish', () => {
    expect(
      derivePublishStatus(3, {generatedAt: 't', changeCount: 3}),
    ).toBe('published');
  });

  it('is changed once the log outgrows the last publish', () => {
    expect(
      derivePublishStatus(4, {generatedAt: 't', changeCount: 3}),
    ).toBe('changed');
  });

  it('stays changed after an undo appends its own compensating entry', () => {
    // A revert is itself a new log entry, so undoing a change back to a
    // previously-published tree still reads as "changed" (log-length
    // comparison, not a tree-state hash) — documented in publishStatus.ts.
    expect(
      derivePublishStatus(5, {generatedAt: 't', changeCount: 3}),
    ).toBe('changed');
  });
});

describe('countNewObjects', () => {
  it('counts each create*/insertExperience/createLevel op once', () => {
    const changes: CurriculumChange[] = [
      {...stamp, seq: 1, op: 'createUnit', courseId: 'c', unit: {id: 'u', displayName: 'U', origin: 'draft'}},
      {
        ...stamp,
        seq: 2,
        op: 'insertExperience',
        lessonId: 'l',
        position: 0,
        experience: {id: 'e', origin: 'draft', kind: 'content', markdown: 'hi'},
      },
      {...stamp, seq: 3, op: 'updateContent', experienceId: 'e', patch: {title: 'x'}},
    ];
    expect(countNewObjects(changes)).toBe(2);
  });

  it('is zero when nothing created anything new', () => {
    const changes: CurriculumChange[] = [
      {...stamp, seq: 1, op: 'updateContent', experienceId: 'e', patch: {title: 'x'}},
    ];
    expect(countNewObjects(changes)).toBe(0);
  });
});
