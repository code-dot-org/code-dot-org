import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {parseLevelXml, patchLevelFile} from '@code-dot-org/authoring';

import type {
  CourseModel,
  CurriculumChange,
  ParseLevelXml,
  PatchLevelFile,
} from '../../authoring/model.js';
import {applyWritebackPlan, computePlanHash} from '../apply.js';
import {buildWritebackPlan, type WritebackPlanInput} from '../plan.js';

// Same bridge-type cast plan.test.ts and boot/__tests__/levelCatalog.test.ts
// already need — see their comments.
const parseLevelXmlBridged = parseLevelXml as unknown as ParseLevelXml;
const patchLevelFileBridged = patchLevelFile as unknown as PatchLevelFile;

const KAREL_LEVEL = `<Karel>
  <config><![CDATA[{
  "game_id": 25,
  "properties": {
    "skin": "harvester",
    "short_instructions": "Get the nectar.",
    "long_instructions": "Get the nectar.",
    "start_direction": "2",
    "flower_type": "redWithNectar"
  },
  "published": true,
  "notes": "",
  "audit_log": "[]"
}]]></config>
</Karel>`;

let root: string;
let levelsDir: string;
let levelPath: string;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'writeback-apply-'));
  // Mirrors the real repo shape (repoRoot/dashboard/config/levels/custom/maze)
  // closely enough for the path-containment check to exercise real prefixes.
  levelsDir = path.join(root, 'dashboard', 'config', 'levels', 'custom', 'maze');
  fs.mkdirSync(levelsDir, {recursive: true});
  levelPath = path.join(levelsDir, 'courseD_maze_ramp1_2024.level');
  fs.writeFileSync(levelPath, KAREL_LEVEL, 'utf8');
});

afterEach(() => {
  fs.rmSync(root, {recursive: true, force: true});
});

function course(experienceId: string, levelKey: string): CourseModel {
  return {
    id: 'c',
    displayName: 'Course',
    origin: 'levelbuilder',
    units: [
      {
        id: 'u',
        displayName: 'Unit',
        origin: 'levelbuilder',
        lessons: [
          {
            id: 'l',
            displayName: 'Lesson',
            origin: 'levelbuilder',
            experiences: [
              {
                id: experienceId,
                origin: 'levelbuilder',
                kind: 'existingLevel',
                levelKey,
                levelType: 'Karel',
                runtime: 'labhost',
                labKey: 'maze',
              },
            ],
          },
        ],
      },
    ],
  };
}

function instructionsChange(
  experienceId: string,
  shortInstructions: string,
  previousShortInstructions: string,
): CurriculumChange {
  return {
    seq: 1,
    at: new Date().toISOString(),
    actor: 'author',
    op: 'overrideLevelInstructions',
    experienceId,
    patch: {shortInstructions},
    previous: {shortInstructions: previousShortInstructions},
  };
}

function baseInput(): WritebackPlanInput {
  return {
    courses: [course('lb:courseD_maze_ramp1_2024', 'courseD_maze_ramp1_2024')],
    changes: [instructionsChange('lb:courseD_maze_ramp1_2024', 'Snap the blocks together!', 'Get the nectar.')],
    resolveLevelFilePath: levelKey =>
      levelKey === 'courseD_maze_ramp1_2024' ? levelPath : undefined,
    readFile: filePath => fs.readFileSync(filePath, 'utf8'),
    parseLevelXml: parseLevelXmlBridged,
    patchLevelFile: patchLevelFileBridged,
    repoRoot: root,
  };
}

describe('applyWritebackPlan', () => {
  it('writes the patched file and reports it applied', () => {
    const outcome = applyWritebackPlan(baseInput());
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw new Error('unreachable');
    expect(outcome.result.applied).toEqual([
      {
        path: 'dashboard/config/levels/custom/maze/courseD_maze_ramp1_2024.level',
        afterHash: expect.any(String),
      },
    ]);
    expect(outcome.result.skipped).toEqual([]);

    const written = fs.readFileSync(levelPath, 'utf8');
    expect(parseLevelXml(written).properties.short_instructions).toBe(
      'Snap the blocks together!',
    );
    // No leftover temp file from the atomic write.
    expect(fs.readdirSync(levelsDir)).toEqual(['courseD_maze_ramp1_2024.level']);
  });

  it('refuses the whole apply with 409-shaped output when the caller\'s plan hash is stale', () => {
    const input = baseInput();
    const stalePlan = buildWritebackPlan(input);
    const staleHash = computePlanHash(stalePlan);

    // The session accrues a further edit after the caller fetched its plan.
    input.changes = [
      ...input.changes,
      instructionsChange(
        'lb:courseD_maze_ramp1_2024',
        'A second edit the caller never saw.',
        'Snap the blocks together!',
      ),
    ];

    const outcome = applyWritebackPlan(input, staleHash);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) throw new Error('unreachable');
    expect(outcome.reason).toBe('plan-changed');
    expect(outcome.planHash).not.toBe(staleHash);
    // The file is untouched — the whole apply was refused, not just skipped.
    expect(fs.readFileSync(levelPath, 'utf8')).toBe(KAREL_LEVEL);
  });

  it('applies when the caller\'s plan hash still matches the recomputed plan', () => {
    const input = baseInput();
    const planHash = computePlanHash(buildWritebackPlan(input));
    const outcome = applyWritebackPlan(input, planHash);
    expect(outcome.ok).toBe(true);
  });

  it('skips one edit as changed-on-disk when the file changes between the plan\'s own read and apply\'s re-verification, and still applies the rest', () => {
    // buildWritebackPlan's own stale-import check (plan.ts's findStaleField)
    // already catches drift that happened BEFORE planning even starts — that
    // path produces a differently-worded skip and is covered by
    // plan.test.ts. This test is about the narrower race apply.ts's own
    // guard exists for: the file changes in the gap between apply's internal
    // recompute-the-plan read and apply's immediately-pre-write re-read. A
    // stateful readFile mock (clean on the first read, drifted from the
    // second read on) is the only way to land in that exact gap
    // deterministically.
    const otherLevelPath = path.join(levelsDir, 'other_level.level');
    fs.writeFileSync(otherLevelPath, KAREL_LEVEL, 'utf8');

    const input = baseInput();
    input.courses = [
      course('lb:courseD_maze_ramp1_2024', 'courseD_maze_ramp1_2024'),
      course('lb:other_level', 'other_level'),
    ];
    input.changes = [
      ...input.changes,
      instructionsChange('lb:other_level', 'Other level edit.', 'Get the nectar.'),
    ];
    const originalResolve = input.resolveLevelFilePath;
    input.resolveLevelFilePath = levelKey =>
      levelKey === 'other_level' ? otherLevelPath : originalResolve(levelKey);

    const drifted = patchLevelFile(KAREL_LEVEL, {
      properties: {short_instructions: 'Edited outside the session'},
    });
    let courseDReadCount = 0;
    input.readFile = filePath => {
      if (filePath === levelPath) {
        courseDReadCount += 1;
        return courseDReadCount === 1 ? KAREL_LEVEL : drifted;
      }
      return fs.readFileSync(filePath, 'utf8');
    };

    const outcome = applyWritebackPlan(input);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw new Error('unreachable');
    expect(outcome.result.applied).toEqual([
      {
        path: 'dashboard/config/levels/custom/maze/other_level.level',
        afterHash: expect.any(String),
      },
    ]);
    expect(outcome.result.skipped).toHaveLength(1);
    expect(outcome.result.skipped[0].reason).toMatch(/changed-on-disk/);

    // Never written — the mock lied about a race, but the real file on disk
    // is untouched.
    expect(fs.readFileSync(levelPath, 'utf8')).toBe(KAREL_LEVEL);
    expect(parseLevelXml(fs.readFileSync(otherLevelPath, 'utf8')).properties.short_instructions).toBe(
      'Other level edit.',
    );
  });

  it('refuses a resolved path outside dashboard/config/levels', () => {
    const outsidePath = path.join(root, 'outside.level');
    fs.writeFileSync(outsidePath, KAREL_LEVEL, 'utf8');
    const input = baseInput();
    input.resolveLevelFilePath = () => outsidePath;

    const outcome = applyWritebackPlan(input);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw new Error('unreachable');
    expect(outcome.result.applied).toEqual([]);
    expect(outcome.result.skipped).toHaveLength(1);
    expect(outcome.result.skipped[0].reason).toMatch(/outside the allowed root/);
    // Unwritten.
    expect(fs.readFileSync(outsidePath, 'utf8')).toBe(KAREL_LEVEL);
  });

  it('refuses a traversal-shaped path even when it happens to resolve under the repo root elsewhere', () => {
    // levelsDir is dashboard/config/levels/custom/maze; three levels of
    // '..' lands in dashboard/config — a real directory, but outside the
    // allowed root (dashboard/config/levels), same as a `../`-laden level
    // name would produce.
    // Must parse as a legal .level for planning to reach the diff step at
    // all; the containment refusal below is apply's own check, independent
    // of what planning already validated.
    const secretPath = path.join(root, 'dashboard', 'config', 'secret.level');
    fs.writeFileSync(secretPath, KAREL_LEVEL, 'utf8');
    const input = baseInput();
    input.resolveLevelFilePath = () => path.join(levelsDir, '..', '..', '..', 'secret.level');

    const outcome = applyWritebackPlan(input);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw new Error('unreachable');
    expect(outcome.result.applied).toEqual([]);
    expect(outcome.result.skipped[0].reason).toMatch(/outside the allowed root/);
    expect(fs.readFileSync(secretPath, 'utf8')).toBe(KAREL_LEVEL);
  });

  it('computePlanHash is stable for an unchanged plan and changes when the plan changes', () => {
    const input = baseInput();
    const planA = buildWritebackPlan(input);
    const planB = buildWritebackPlan(baseInput());
    expect(computePlanHash(planA)).toBe(computePlanHash(planB));

    input.changes = [
      ...input.changes,
      instructionsChange('lb:courseD_maze_ramp1_2024', 'Different.', 'Snap the blocks together!'),
    ];
    const planC = buildWritebackPlan(input);
    expect(computePlanHash(planC)).not.toBe(computePlanHash(planA));
  });
});
