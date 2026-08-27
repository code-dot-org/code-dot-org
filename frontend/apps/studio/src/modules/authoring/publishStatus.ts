import type {CurriculumChange} from '@code-dot-org/authoring';

import type {LastPublishInfo} from './api';

export type PublishStatus = 'draft' | 'changed' | 'published';

export const PUBLISH_STATUS_LABEL: Record<PublishStatus, string> = {
  draft: 'Draft',
  changed: 'Changed',
  published: 'Published',
};

/**
 * Draft/Changed/Published, derived from the log's length against the newest
 * publish artifact's own change count — not a tree-state hash. A publish
 * never removes log entries, and the log only ever grows, so "nothing new
 * since that count" is exactly "published" and any growth is "changed". A
 * revert (Undo) appends its own entry, so undoing back to a
 * previously-published tree still reads as Changed rather than Published —
 * documented, not a bug: matching content by hash would need to walk and
 * diff the whole tree on every state fetch, for a distinction ("did I get
 * back to a state I've already shipped") no other CMS surfaces either (see
 * docs/prototypes/author-mode-cms-ux-research.md §c).
 */
export function derivePublishStatus(
  changeCount: number,
  lastPublish: LastPublishInfo | undefined,
): PublishStatus {
  if (!lastPublish) {
    return 'draft';
  }
  return changeCount > lastPublish.changeCount ? 'changed' : 'published';
}

// Each of these ops mints exactly one new id (buildChangeSet's own newIds
// groups by these same ops) — no dedup needed to turn a count of matching
// log entries into a count of new objects.
const CREATE_OPS = new Set<CurriculumChange['op']>([
  'createCourse',
  'createUnit',
  'createLesson',
  'insertExperience',
  'createLevel',
]);

/**
 * A preview of buildChangeSet's `newObjects` count, computed client-side
 * from the log we already have — so the publish confirmation can show "N
 * new items" before POST /api/publish actually builds the changeset.
 */
export function countNewObjects(changes: CurriculumChange[]): number {
  return changes.filter(change => CREATE_OPS.has(change.op)).length;
}
