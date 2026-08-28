// The write-back plan's built-in gate (writeback plan §2.5): the importer
// already reads .level files, which makes the round trip mechanical to
// check for real —
//
//   1. seed a session the same way the real server does: a levelProperties
//      entry built by buildMazeLevelProperties from a real .level file's
//      current bytes;
//   2. drive the SAME author-facing path a UI action would (applyCurriculumChange),
//      so AuthoringState's own merge logic (mergeInstructionsOverride /
//      mergeDefinitionOverride) computes the "expected" served state;
//   3. plan + apply against a temp copy of the file (never the real
//      dashboard/config);
//   4. re-import the temp copy through the real importer
//      (parseLevelXml -> buildMazeLevelProperties) and diff the result
//      against step 2's expected state.
//
// An empty diff on every touched key means the file the writer produced
// re-imports to the same wire shape the author was looking at — the
// property this whole module exists to guarantee.
import fs, {existsSync, readdirSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {
  applyChange,
  buildMazeLevelProperties,
  parseLevelXml,
  patchLevelFile,
  type ParsedLevelXml,
} from '@code-dot-org/authoring';

import type {
  ApplyChange,
  CourseModel,
  ParseLevelXml,
  PatchLevelFile,
} from '../../authoring/model.js';
import {AuthoringState} from '../../state/AuthoringState.js';
import {EMPTY_SNAPSHOT, SessionStore} from '../../store/SessionStore.js';
import {applyWritebackPlan} from '../apply.js';
import {buildWritebackPlan} from '../plan.js';

// Same bridge-type cast every other writeback test needs — @code-dot-org/
// authoring's real types are structurally close to, but not identical to,
// this service's local mirror in authoring/model.ts.
const parseLevelXmlBridged = parseLevelXml as unknown as ParseLevelXml;
const patchLevelFileBridged = patchLevelFile as unknown as PatchLevelFile;
const applyChangeBridged = applyChange as unknown as ApplyChange;

function findRepoRoot(startDir: string): string | undefined {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    if (existsSync(path.join(dir, 'dashboard', 'config'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
  return undefined;
}

const repoRoot = findRepoRoot(path.dirname(fileURLToPath(import.meta.url)));

// courseA_bee_seq10.level (cited throughout the writeback plan doc's risk
// list): a 40-entry audit_log, authored_hints, contained_level_names,
// parent_level_id, and a full start/toolbox/solution <blocks> set — the
// richest real fixture available, so a round-trip bug in an unmodelled
// field would show up here first.
const SAMPLE_LEVEL_KEY = 'courseA_bee_seq10';
const NUMERIC_ID = 1;
const LEVEL_TYPE = 'Karel';

interface Fixture {
  sessionRoot: string;
  fixtureRoot: string;
  levelPath: string;
  originalXml: string;
  state: AuthoringState;
}

/** One temp repo-shaped tree, one temp session, one seeded imported level. */
function setupFixture(): Fixture {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'writeback-roundtrip-repo-'));
  const sessionRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'writeback-roundtrip-session-'));
  const levelsDir = path.join(fixtureRoot, 'dashboard/config/levels/custom/maze');
  fs.mkdirSync(levelsDir, {recursive: true});
  const levelPath = path.join(levelsDir, `${SAMPLE_LEVEL_KEY}.level`);
  const originalXml = fs.readFileSync(
    path.join(repoRoot!, 'dashboard/config/levels/custom/maze', `${SAMPLE_LEVEL_KEY}.level`),
    'utf8',
  );
  fs.writeFileSync(levelPath, originalXml, 'utf8');

  const parsedOriginal = parseLevelXml(originalXml);
  const importedProperties = buildMazeLevelProperties(
    NUMERIC_ID,
    SAMPLE_LEVEL_KEY,
    LEVEL_TYPE,
    parsedOriginal,
  );

  const course: CourseModel = {
    id: 'course-1',
    displayName: 'Course',
    origin: 'levelbuilder',
    units: [
      {
        id: 'unit-1',
        displayName: 'Unit',
        origin: 'levelbuilder',
        lessons: [
          {
            id: 'lesson-1',
            displayName: 'Lesson',
            origin: 'levelbuilder',
            experiences: [
              {
                id: `lb:${SAMPLE_LEVEL_KEY}`,
                origin: 'levelbuilder',
                kind: 'existingLevel',
                levelKey: SAMPLE_LEVEL_KEY,
                levelType: LEVEL_TYPE,
                runtime: 'labhost',
                labKey: 'maze',
                levelNumericId: NUMERIC_ID,
              },
            ],
          },
        ],
      },
    ],
  };

  const state = new AuthoringState({
    store: new SessionStore(sessionRoot),
    applyChange: applyChangeBridged,
    snapshot: {
      ...EMPTY_SNAPSHOT,
      courses: [course],
      levelProperties: {[String(NUMERIC_ID)]: importedProperties},
    },
    changes: [],
  });

  return {sessionRoot, fixtureRoot, levelPath, originalXml, state};
}

function cleanupFixture(fixture: Fixture): void {
  fs.rmSync(fixture.sessionRoot, {recursive: true, force: true});
  fs.rmSync(fixture.fixtureRoot, {recursive: true, force: true});
}

/** Plans + applies fixture.state's current change log against the temp repo. */
function planAndApply(fixture: Fixture) {
  const input = {
    courses: fixture.state.getSnapshot().courses,
    changes: fixture.state.getChanges(),
    resolveLevelFilePath: (levelKey: string) =>
      levelKey === SAMPLE_LEVEL_KEY ? fixture.levelPath : undefined,
    readFile: (filePath: string) => fs.readFileSync(filePath, 'utf8'),
    parseLevelXml: parseLevelXmlBridged,
    patchLevelFile: patchLevelFileBridged,
    repoRoot: fixture.fixtureRoot,
  };
  return applyWritebackPlan(input);
}

/** Re-imports the (now-written) temp file exactly as a fresh session boot would. */
function reimport(fixture: Fixture): Record<string, unknown> {
  const newXml = fs.readFileSync(fixture.levelPath, 'utf8');
  const parsed: ParsedLevelXml = parseLevelXml(newXml);
  return buildMazeLevelProperties(NUMERIC_ID, SAMPLE_LEVEL_KEY, LEVEL_TYPE, parsed);
}

// Same convention as boot/__tests__/levelCatalog.test.ts: skip rather than
// fail when a real dashboard/config isn't reachable from this checkout.
describe.skipIf(!repoRoot)(
  "writeback round-trip: plan -> apply -> re-import equals the session's merged state",
  () => {
    let fixture: Fixture;

    beforeEach(() => {
      fixture = setupFixture();
    });

    afterEach(() => {
      cleanupFixture(fixture);
    });

    it('instructions-only: shortInstructions lands in the file and re-imports identically, both casings', () => {
      fixture.state.applyCurriculumChange(
        {
          op: 'overrideLevelInstructions',
          experienceId: `lb:${SAMPLE_LEVEL_KEY}`,
          patch: {shortInstructions: 'Snap the blocks together and click Run!'},
        },
        'author',
      );

      const outcome = planAndApply(fixture);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error('unreachable');
      expect(outcome.result.applied).toHaveLength(1);
      expect(outcome.result.skipped).toEqual([]);

      const expected = fixture.state.getLevelProperties(String(NUMERIC_ID))!;
      const reimported = reimport(fixture);
      expect(reimported.shortInstructions).toBe('Snap the blocks together and click Run!');
      expect(reimported.shortInstructions).toBe(expected.shortInstructions);
      // The camel/snake twin plan.ts's doc comment calls out explicitly:
      // both casings must be present and equal, not just one.
      expect(reimported.short_instructions).toBe(expected.short_instructions);
      expect(reimported.short_instructions).toBe('Snap the blocks together and click Run!');
    });

    it('definition-only: nectar_goal (a plain scalar, not a solution-staleness trigger) round-trips', () => {
      fixture.state.applyCurriculumChange(
        {
          op: 'overrideLevelDefinition',
          experienceId: `lb:${SAMPLE_LEVEL_KEY}`,
          patch: {nectar_goal: '9'},
        },
        'author',
      );

      const outcome = planAndApply(fixture);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error('unreachable');
      expect(outcome.result.applied).toHaveLength(1);
      expect(outcome.result.skipped).toEqual([]);

      const expected = fixture.state.getLevelProperties(String(NUMERIC_ID))!;
      const reimported = reimport(fixture);
      expect(reimported.nectar_goal).toBe('9');
      expect(reimported.nectar_goal).toBe(expected.nectar_goal);
    });

    it('post-apply: re-opening the write-back dialog after a successful write shows an empty plan, not a stale-import refusal', () => {
      // This is the exact question Pass 4 of the write-back plan asks to be
      // checked live and fixed if wrong: after a write lands, the file now
      // matches the override the change log still describes, so a second
      // plan computation must see "nothing left to write" — not treat its
      // own prior output as unexplained drift. (It did, once — see plan.ts's
      // findStaleField and this file's git history.)
      fixture.state.applyCurriculumChange(
        {
          op: 'overrideLevelInstructions',
          experienceId: `lb:${SAMPLE_LEVEL_KEY}`,
          patch: {shortInstructions: 'Applied once already.'},
        },
        'author',
      );
      const first = planAndApply(fixture);
      expect(first.ok).toBe(true);
      if (!first.ok) throw new Error('unreachable');
      expect(first.result.applied).toHaveLength(1);

      // No new changes since — the plan.ts input is rebuilt fresh here to
      // mirror the client fetching GET /api/writeback/plan again, exactly
      // as the dialog re-fetch does after a successful apply.
      const secondPlan = buildWritebackPlan({
        courses: fixture.state.getSnapshot().courses,
        changes: fixture.state.getChanges(),
        resolveLevelFilePath: levelKey =>
          levelKey === SAMPLE_LEVEL_KEY ? fixture.levelPath : undefined,
        readFile: filePath => fs.readFileSync(filePath, 'utf8'),
        parseLevelXml: parseLevelXmlBridged,
        patchLevelFile: patchLevelFileBridged,
        repoRoot: fixture.fixtureRoot,
      });
      expect(secondPlan.edits).toEqual([]);
      expect(secondPlan.skipped).toEqual([]);
    });

    it('both: an instructions override and a definition override on the same level land in one write', () => {
      fixture.state.applyCurriculumChange(
        {
          op: 'overrideLevelInstructions',
          experienceId: `lb:${SAMPLE_LEVEL_KEY}`,
          patch: {longInstructions: 'Use exactly the blocks shown.'},
        },
        'author',
      );
      fixture.state.applyCurriculumChange(
        {
          op: 'overrideLevelDefinition',
          experienceId: `lb:${SAMPLE_LEVEL_KEY}`,
          patch: {honey_goal: '5'},
        },
        'author',
      );

      const outcome = planAndApply(fixture);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error('unreachable');
      // Both changes accumulate onto the SAME level -> one file edit, not two.
      expect(outcome.result.applied).toHaveLength(1);
      expect(outcome.result.skipped).toEqual([]);

      const expected = fixture.state.getLevelProperties(String(NUMERIC_ID))!;
      const reimported = reimport(fixture);
      expect(reimported.longInstructions).toBe('Use exactly the blocks shown.');
      expect(reimported.longInstructions).toBe(expected.longInstructions);
      expect(reimported.honey_goal).toBe('5');
      expect(reimported.honey_goal).toBe(expected.honey_goal);
      // Untouched fields still carry through — e.g. the level's skin, never
      // touched by either patch.
      expect(reimported.skin).toBe(expected.skin);
    });

    it('delete-key (null): removing flower_type removes it from the file and both served casings', () => {
      expect(parseLevelXml(fixture.originalXml).properties.flower_type).toBe('redWithNectar');

      fixture.state.applyCurriculumChange(
        {
          op: 'overrideLevelDefinition',
          experienceId: `lb:${SAMPLE_LEVEL_KEY}`,
          patch: {flower_type: null},
        },
        'author',
      );

      const outcome = planAndApply(fixture);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error('unreachable');
      expect(outcome.result.applied).toHaveLength(1);

      const expected = fixture.state.getLevelProperties(String(NUMERIC_ID))!;
      expect(expected.flower_type).toBeUndefined();
      expect(expected.flowerType).toBeUndefined(); // CAMEL_SNAKE_TWINS deletes both.

      const newXml = fs.readFileSync(fixture.levelPath, 'utf8');
      expect(parseLevelXml(newXml).properties.flower_type).toBeUndefined();

      const reimported = reimport(fixture);
      expect(reimported.flower_type).toBeUndefined();
      expect(reimported.flowerType).toBeUndefined();
    });

    it('changed-on-disk collision: a file mutated after planning is skipped, not overwritten, and every other edit still applies', () => {
      // A second level in the same session, mutated only in this test.
      const otherLevelPath = path.join(
        path.dirname(fixture.levelPath),
        'other_maze_level.level',
      );
      fs.writeFileSync(otherLevelPath, fixture.originalXml, 'utf8');
      const otherExperience = {
        id: 'lb:other_maze_level',
        origin: 'levelbuilder' as const,
        kind: 'existingLevel' as const,
        levelKey: 'other_maze_level',
        levelType: LEVEL_TYPE,
        runtime: 'labhost' as const,
        labKey: 'maze' as const,
        levelNumericId: 2,
      };
      fixture.state.getSnapshot().courses[0].units[0].lessons[0].experiences.push(
        otherExperience,
      );
      fixture.state.registerLevelProperties({
        '2': buildMazeLevelProperties(2, 'other_maze_level', LEVEL_TYPE, parseLevelXml(fixture.originalXml)),
      });

      fixture.state.applyCurriculumChange(
        {
          op: 'overrideLevelInstructions',
          experienceId: `lb:${SAMPLE_LEVEL_KEY}`,
          patch: {shortInstructions: 'Edit on the level someone else touches too.'},
        },
        'author',
      );
      fixture.state.applyCurriculumChange(
        {
          op: 'overrideLevelInstructions',
          experienceId: 'lb:other_maze_level',
          patch: {shortInstructions: 'A clean edit on an untouched file.'},
        },
        'author',
      );

      // Simulate an external process (another checkout, a manual edit)
      // writing SAMPLE_LEVEL_KEY's file between planning and applying, by
      // wrapping readFile so its FIRST read (buildWritebackPlan's own,
      // inside applyWritebackPlan) sees the clean baseline, and every
      // subsequent read (apply's own re-verification) sees the drift.
      const drifted = patchLevelFile(fixture.originalXml, {
        properties: {short_instructions: 'Edited outside the session entirely.'},
      });
      let reads = 0;
      const input = {
        courses: fixture.state.getSnapshot().courses,
        changes: fixture.state.getChanges(),
        resolveLevelFilePath: (levelKey: string) =>
          levelKey === SAMPLE_LEVEL_KEY
            ? fixture.levelPath
            : levelKey === 'other_maze_level'
              ? otherLevelPath
              : undefined,
        readFile: (filePath: string) => {
          if (filePath === fixture.levelPath) {
            reads += 1;
            return reads === 1 ? fixture.originalXml : drifted;
          }
          return fs.readFileSync(filePath, 'utf8');
        },
        parseLevelXml: parseLevelXmlBridged,
        patchLevelFile: patchLevelFileBridged,
        repoRoot: fixture.fixtureRoot,
      };

      const outcome = applyWritebackPlan(input);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) throw new Error('unreachable');
      expect(outcome.result.applied).toEqual([
        {
          path: 'dashboard/config/levels/custom/maze/other_maze_level.level',
          afterHash: expect.any(String),
        },
      ]);
      expect(outcome.result.skipped).toHaveLength(1);
      expect(outcome.result.skipped[0].reason).toMatch(/changed-on-disk/);

      // The mocked-drifted file was never actually written to by apply.
      expect(fs.readFileSync(fixture.levelPath, 'utf8')).toBe(fixture.originalXml);
      // The other level's edit is unaffected and re-imports correctly.
      const reimportedOther = buildMazeLevelProperties(
        2,
        'other_maze_level',
        LEVEL_TYPE,
        parseLevelXml(fs.readFileSync(otherLevelPath, 'utf8')),
      );
      expect(reimportedOther.shortInstructions).toBe('A clean edit on an untouched file.');
      // Only the level file itself changed — no stray temp files left behind.
      expect(readdirSync(path.dirname(fixture.levelPath)).sort()).toEqual(
        [`${SAMPLE_LEVEL_KEY}.level`, 'other_maze_level.level'].sort(),
      );
    });
  },
);
