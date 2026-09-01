import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

import {
  buildChangelog,
  buildProvenance,
  buildPullRequestBody,
  filterAuthorshipTrail,
  filterChatTurns,
  findWidgetReference,
} from '../provenance.js';
import type {ChangeLike, ChatTurnLike, CurriculumSnapshotLike} from '../types.js';

const FIXTURES_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'fixtures',
);

/** A real slice of a session's `changes.jsonl` (7 lines, seq 100-104,
 * 251-252) — copied verbatim from `.authoring/sessions/default/` for
 * `draft-widget-253582fd` ("Predict the Trace"). Includes ops the filter
 * must reject (`attachExistingLevel`, `insertExperience`, and a
 * `createWidget`/`updateWidgetMetadata` pair for a DIFFERENT widget id is
 * deliberately absent here — negative coverage for "wrong widget id" comes
 * from the synthetic test below instead, since this session only ever
 * authored one widget in this seq range). */
function readChangesFixture(): ChangeLike[] {
  return fs
    .readFileSync(path.join(FIXTURES_DIR, 'changes.jsonl'), 'utf8')
    .trim()
    .split('\n')
    .map(line => JSON.parse(line) as ChangeLike);
}

/** A real slice of `chat.jsonl` (4 messages) scoped to the same lesson
 * (`bbb-l3`) that produced `draft-widget-253582fd`. */
function readChatFixture(): ChatTurnLike[] {
  return fs
    .readFileSync(path.join(FIXTURES_DIR, 'chat.jsonl'), 'utf8')
    .trim()
    .split('\n')
    .map(line => JSON.parse(line) as ChatTurnLike);
}

describe('filterAuthorshipTrail (real changes.jsonl fixture)', () => {
  it('keeps only createWidget/updateWidgetMetadata entries for the given widget id, in order', () => {
    const changes = readChangesFixture();
    const trail = filterAuthorshipTrail(changes, 'draft-widget-253582fd');

    expect(trail).toEqual([
      {seq: 103, at: '2026-08-26T20:42:01.729Z', actor: 'agent', op: 'createWidget'},
      {seq: 251, at: '2026-08-28T05:12:10.918Z', actor: 'author', op: 'updateWidgetMetadata'},
      {seq: 252, at: '2026-08-28T05:12:54.276Z', actor: 'author', op: 'updateWidgetMetadata'},
    ]);
  });

  it('excludes attachExistingLevel/insertExperience, and a widget id that never appears', () => {
    const changes = readChangesFixture();
    expect(filterAuthorshipTrail(changes, 'draft-widget-does-not-exist')).toEqual([]);
  });

  it('does not cross-match a different widget id', () => {
    const changes: ChangeLike[] = [
      ...readChangesFixture(),
      {
        op: 'createWidget',
        descriptor: {id: 'draft-widget-other'},
        seq: 999,
        at: '2026-08-29T00:00:00.000Z',
        actor: 'agent',
      },
    ];
    const trail = filterAuthorshipTrail(changes, 'draft-widget-253582fd');
    expect(trail.every(entry => entry.seq !== 999)).toBe(true);
  });
});

describe('filterChatTurns (real chat.jsonl fixture)', () => {
  const reference = {
    courseId: 'block-by-block',
    courseName: 'Block by Block',
    unitId: 'block-by-block-unit1',
    unitName: 'Unit One',
    lessonId: 'bbb-l3',
    lessonName: 'Lesson Three',
    experienceId: 'draft-exp-bc550ae1',
  };

  it('keeps messages scoped to the reference lesson', () => {
    const chatLog = readChatFixture();
    const turns = filterChatTurns(chatLog, reference);
    expect(turns).toHaveLength(4);
    expect(turns[0]).toEqual({
      role: 'author',
      at: '2026-08-26T20:40:35.631Z',
      text: expect.stringContaining("Songwriter's Toolbox") as unknown as string,
    });
  });

  it('returns [] when there is no reference at all', () => {
    expect(filterChatTurns(readChatFixture(), undefined)).toEqual([]);
  });

  it('excludes messages scoped to a different lesson', () => {
    const chatLog: ChatTurnLike[] = [
      ...readChatFixture(),
      {role: 'author', at: '2026-08-29T00:00:00.000Z', text: 'unrelated', scope: {lessonId: 'other-lesson'}},
    ];
    const turns = filterChatTurns(chatLog, reference);
    expect(turns.every(t => t.text !== 'unrelated')).toBe(true);
  });
});

describe('findWidgetReference', () => {
  function snapshotWithWidget(widgetId: string): CurriculumSnapshotLike {
    return {
      courses: [
        {
          id: 'course-1',
          displayName: 'Course One',
          units: [
            {
              id: 'unit-1',
              displayName: 'Unit One',
              lessons: [
                {
                  id: 'lesson-1',
                  displayName: 'Lesson One',
                  experiences: [{id: 'exp-1', kind: 'widget', widgetId}],
                },
              ],
            },
          ],
        },
      ],
    };
  }

  it('finds the course/unit/lesson/experience referencing a widget', () => {
    const ref = findWidgetReference(snapshotWithWidget('draft-widget-abc123'), 'draft-widget-abc123');
    expect(ref).toEqual({
      courseId: 'course-1',
      courseName: 'Course One',
      unitId: 'unit-1',
      unitName: 'Unit One',
      lessonId: 'lesson-1',
      lessonName: 'Lesson One',
      experienceId: 'exp-1',
    });
  });

  it('returns undefined for a widget no experience references', () => {
    const ref = findWidgetReference(snapshotWithWidget('some-other-widget'), 'draft-widget-abc123');
    expect(ref).toBeUndefined();
  });
});

describe('buildProvenance / buildPullRequestBody / buildChangelog', () => {
  const provenanceInput = {
    slug: 'predict-the-trace',
    sessionId: 'default',
    widgetId: 'draft-widget-253582fd',
    authorshipTrail: filterAuthorshipTrail(readChangesFixture(), 'draft-widget-253582fd'),
    chatTurns: filterChatTurns(readChatFixture(), {
      courseId: 'block-by-block',
      courseName: 'Block by Block',
      unitId: 'block-by-block-unit1',
      unitName: 'Unit One',
      lessonId: 'bbb-l3',
      lessonName: 'Lesson Three',
      experienceId: 'draft-exp-bc550ae1',
    }),
    reference: {
      courseId: 'block-by-block',
      courseName: 'Block by Block',
      unitId: 'block-by-block-unit1',
      unitName: 'Unit One',
      lessonId: 'bbb-l3',
      lessonName: 'Lesson Three',
      experienceId: 'draft-exp-bc550ae1',
    },
  };

  it('reports the authorship trail, chat turns, and reference in PROVENANCE.md', () => {
    const md = buildProvenance(provenanceInput);
    expect(md).toContain('draft-widget-253582fd');
    expect(md).toContain('session `default`');
    expect(md).toContain('seq 103, 2026-08-26T20:42:01.729Z, actor: agent, op: createWidget');
    expect(md).toContain("Songwriter's Toolbox");
    expect(md).toContain('Course "Block by Block"');
  });

  it('says so plainly when there is no reference or no chat turns', () => {
    const md = buildProvenance({...provenanceInput, reference: undefined, chatTurns: []});
    expect(md).toContain('Not currently attached to any lesson experience.');
    expect(md).toContain('No chat turns scoped to this widget were cheaply available.');
  });

  it('the PR body carries the same content as PROVENANCE.md, plus a lead-in line', () => {
    const body = buildPullRequestBody(provenanceInput);
    expect(body).toContain('Graduates `predict-the-trace` from an Author Mode authoring session');
    expect(body).toContain(buildProvenance(provenanceInput));
  });

  it('the changelog entry names the version and today\'s date', () => {
    const changelog = buildChangelog('1.0.0', new Date('2026-08-31T12:00:00.000Z'));
    expect(changelog).toContain('## 1.0.0 - 2026-08-31');
  });
});
