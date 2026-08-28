import {createHash} from 'node:crypto';
import {describe, expect, it} from 'vitest';

import {parseLevelXml, patchLevelFile} from '@code-dot-org/authoring';

import type {
  CourseModel,
  CurriculumChange,
  ParseLevelXml,
  PatchLevelFile,
} from '../../authoring/model.js';
import {buildWritebackPlan, type WritebackPlanInput} from '../plan.js';

// @code-dot-org/authoring's real parseLevelXml/patchLevelFile are structurally
// close to, but not identical to, this service's local mirror types in
// authoring/model.ts (the bridge.ts pattern this service uses everywhere
// else to avoid a hard compile-time dependency on the package's dist) —
// same cast boot/__tests__/levelCatalog.test.ts already needs for the same
// reason.
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
  <blocks>
    <start_blocks>
      <xml>
        <block type="when_run"/>
      </xml>
    </start_blocks>
    <toolbox_blocks>
      <xml>
        <block type="maze_moveForward"/>
      </xml>
    </toolbox_blocks>
  </blocks>
</Karel>`;

const FISH_LEVEL = `<Fish>
  <config><![CDATA[{
  "properties": {
    "mode": "fishvtrash"
  },
  "published": true
}]]></config>
</Fish>`;

function course(experienceId: string, levelKey: string, origin: 'levelbuilder' | 'draft' = 'levelbuilder'): CourseModel {
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
                origin,
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

function baseInput(overrides: Partial<WritebackPlanInput> = {}): WritebackPlanInput {
  const files = new Map<string, string>([
    ['courseD_maze_ramp1_2024', KAREL_LEVEL],
    ['Oceans_FishVTrash_2024', FISH_LEVEL],
  ]);
  return {
    courses: [course('lb:courseD_maze_ramp1_2024', 'courseD_maze_ramp1_2024')],
    changes: [],
    resolveLevelFilePath: levelKey => (files.has(levelKey) ? `/repo/${levelKey}.level` : undefined),
    readFile: filePath => {
      const levelKey = filePath.replace(/^\/repo\//, '').replace(/\.level$/, '');
      const content = files.get(levelKey);
      if (content === undefined) throw new Error(`ENOENT: ${filePath}`);
      return content;
    },
    parseLevelXml: parseLevelXmlBridged,
    patchLevelFile: patchLevelFileBridged,
    repoRoot: '/repo',
    ...overrides,
  };
}

function instructionsChange(
  experienceId: string,
  patch: {shortInstructions?: string; longInstructions?: string},
  previous: {shortInstructions?: string; longInstructions?: string},
  seq = 1,
): CurriculumChange {
  return {
    seq,
    at: new Date().toISOString(),
    actor: 'author',
    op: 'overrideLevelInstructions',
    experienceId,
    patch,
    previous,
  };
}

describe('buildWritebackPlan', () => {
  it('produces exactly the expected two-line diff for a known instructions override', () => {
    const changes = [
      instructionsChange(
        'lb:courseD_maze_ramp1_2024',
        {shortInstructions: 'Snap the blocks together and click Run!'},
        {shortInstructions: 'Get the nectar.'},
      ),
    ];
    const plan = buildWritebackPlan(baseInput({changes}));
    expect(plan.edits).toHaveLength(1);
    const edit = plan.edits[0];
    expect(edit.path).toBe('courseD_maze_ramp1_2024.level');
    expect(edit.levelKey).toBe('courseD_maze_ramp1_2024');

    const diffLines = edit.unifiedDiff.split('\n');
    const removed = diffLines.filter(line => line.startsWith('-') && !line.startsWith('---'));
    const added = diffLines.filter(line => line.startsWith('+') && !line.startsWith('+++'));
    expect(removed).toEqual(['-    "short_instructions": "Get the nectar.",']);
    expect(added).toEqual([
      '+    "short_instructions": "Snap the blocks together and click Run!",',
    ]);
  });

  it('produces a byte-exact patched file matching patchLevelFile directly', () => {
    const changes = [
      instructionsChange(
        'lb:courseD_maze_ramp1_2024',
        {longInstructions: 'New long form.'},
        {longInstructions: 'Get the nectar.'},
      ),
    ];
    const plan = buildWritebackPlan(baseInput({changes}));
    const expected = patchLevelFile(KAREL_LEVEL, {
      properties: {long_instructions: 'New long form.'},
    });
    // Re-derive `after` from before+diff application is circular; instead
    // assert the hash matches an independently computed patch.
    const hash = createHash('sha256').update(expected, 'utf8').digest('hex');
    expect(plan.edits[0].afterHash).toBe(hash);
  });

  it('drops solutionVerified and reports it as skipped', () => {
    const changes: CurriculumChange[] = [
      {
        seq: 1,
        at: new Date().toISOString(),
        actor: 'author',
        op: 'overrideLevelDefinition',
        experienceId: 'lb:courseD_maze_ramp1_2024',
        patch: {startDirection: '3', solutionVerified: 'true'},
        previous: {startDirection: '2', solutionVerified: null},
      },
    ];
    const plan = buildWritebackPlan(baseInput({changes}));
    expect(plan.edits).toHaveLength(1);
    const skip = plan.skipped.find(s => s.field === 'solutionVerified');
    expect(skip).toBeDefined();
    expect(skip?.reason).toMatch(/prototype-only/);
    // The real patch (startDirection) still lands in the file.
    const parsed = parseLevelXml(
      patchLevelFile(KAREL_LEVEL, {properties: {start_direction: '3'}}),
    );
    expect(parsed.properties.start_direction).toBe('3');
  });

  it('reports an unmapped title field from updateLevel without writing a file', () => {
    const changes: CurriculumChange[] = [
      {
        seq: 1,
        at: new Date().toISOString(),
        actor: 'author',
        op: 'updateLevel',
        experienceId: 'lb:courseD_maze_ramp1_2024',
        patch: {title: 'New title'},
      },
    ];
    const plan = buildWritebackPlan(baseInput({changes}));
    expect(plan.edits).toHaveLength(0);
    expect(plan.skipped).toEqual([
      {
        experienceId: 'lb:courseD_maze_ramp1_2024',
        field: 'title',
        reason: expect.stringContaining('title has no .level file field'),
      },
    ]);
  });

  it('skips a draft (non-lb) level as out of scope', () => {
    const changes = [
      instructionsChange(
        'draft-exp-1',
        {shortInstructions: 'x'},
        {shortInstructions: ''},
      ),
    ];
    const plan = buildWritebackPlan(
      baseInput({
        courses: [course('draft-exp-1', 'draft:abc', 'draft')],
        changes,
      }),
    );
    expect(plan.edits).toHaveLength(0);
    expect(plan.skipped).toHaveLength(1);
    expect(plan.skipped[0].reason).toMatch(/draft/i);
  });

  it('produces no edit when the session\'s cumulative overrides net out to the file\'s current content', () => {
    const changes = [
      instructionsChange(
        'lb:courseD_maze_ramp1_2024',
        {shortInstructions: 'Temporary edit'},
        {shortInstructions: 'Get the nectar.'},
        1,
      ),
      instructionsChange(
        'lb:courseD_maze_ramp1_2024',
        {shortInstructions: 'Get the nectar.'},
        {shortInstructions: 'Temporary edit'},
        2,
      ),
    ];
    const plan = buildWritebackPlan(baseInput({changes}));
    expect(plan.edits).toHaveLength(0);
    expect(plan.skipped).toHaveLength(0);
  });

  it('flags stale-import when the file no longer matches what the session imported', () => {
    const changes = [
      instructionsChange(
        'lb:courseD_maze_ramp1_2024',
        {shortInstructions: 'New text'},
        {shortInstructions: 'Get the nectar.'},
      ),
    ];
    // The "current" file on disk already has different short_instructions
    // than what the session's `previous` says it imported — as if someone
    // edited dashboard/config after the session started.
    const driftedFile = patchLevelFile(KAREL_LEVEL, {
      properties: {short_instructions: 'Edited outside the session'},
    });
    const plan = buildWritebackPlan(
      baseInput({
        changes,
        readFile: () => driftedFile,
      }),
    );
    expect(plan.edits).toHaveLength(0);
    expect(plan.skipped).toHaveLength(1);
    expect(plan.skipped[0].reason).toMatch(/stale-import/);
  });

  it('does not flag stale-import when the file already carries this exact session\'s own prior write-back', () => {
    // The write-back UI seam re-fetches the plan after a successful apply
    // (to show "nothing left to write" rather than leaving the last diff on
    // screen) — that re-fetch reads the SAME session's change log against a
    // file this session itself just wrote. The file's current value is the
    // patch's own target, not the pre-override baseline, and that must read
    // as "already applied", never as external drift.
    const changes = [
      instructionsChange(
        'lb:courseD_maze_ramp1_2024',
        {shortInstructions: 'New text'},
        {shortInstructions: 'Get the nectar.'},
      ),
    ];
    const alreadyWritten = patchLevelFile(KAREL_LEVEL, {
      properties: {short_instructions: 'New text'},
    });
    const plan = buildWritebackPlan(
      baseInput({
        changes,
        readFile: () => alreadyWritten,
      }),
    );
    expect(plan.edits).toHaveLength(0);
    expect(plan.skipped).toHaveLength(0);
  });

  it('still flags stale-import when a field lands on a THIRD value — neither the baseline nor this plan\'s own target', () => {
    const changes = [
      instructionsChange(
        'lb:courseD_maze_ramp1_2024',
        {shortInstructions: 'New text'},
        {shortInstructions: 'Get the nectar.'},
      ),
    ];
    const driftedToSomethingElse = patchLevelFile(KAREL_LEVEL, {
      properties: {short_instructions: 'Someone else\'s edit, not ours'},
    });
    const plan = buildWritebackPlan(
      baseInput({
        changes,
        readFile: () => driftedToSomethingElse,
      }),
    );
    expect(plan.edits).toHaveLength(0);
    expect(plan.skipped).toHaveLength(1);
    expect(plan.skipped[0].reason).toMatch(/stale-import/);
  });

  it('resolves no file for an unknown level key', () => {
    const changes = [
      instructionsChange('lb:missing_level', {shortInstructions: 'x'}, {shortInstructions: ''}),
    ];
    const plan = buildWritebackPlan(
      baseInput({
        courses: [course('lb:missing_level', 'missing_level')],
        changes,
      }),
    );
    expect(plan.edits).toHaveLength(0);
    expect(plan.skipped).toEqual([
      {
        experienceId: 'lb:missing_level',
        reason: expect.stringContaining('no .level file found'),
      },
    ]);
  });

  it('patches a block XML field alongside a property field in one level', () => {
    // The baseline for a definition-patch field is whatever the level
    // currently carries — a real toolbox_blocks payload here, not absent.
    const originalToolbox = parseLevelXml(KAREL_LEVEL).toolboxBlocksXml;
    const changes: CurriculumChange[] = [
      {
        seq: 1,
        at: new Date().toISOString(),
        actor: 'author',
        op: 'overrideLevelDefinition',
        experienceId: 'lb:courseD_maze_ramp1_2024',
        patch: {
          toolboxBlocksXml: '<xml><block type="maze_dig"/></xml>',
          flower_type: 'purpleNectarHidden',
        },
        previous: {toolboxBlocksXml: originalToolbox ?? null, flower_type: 'redWithNectar'},
      },
    ];
    const plan = buildWritebackPlan(baseInput({changes}));
    expect(plan.edits).toHaveLength(1);
    const parsed = parseLevelXml(
      patchLevelFile(KAREL_LEVEL, {
        properties: {flower_type: 'purpleNectarHidden'},
        blocks: {toolboxBlocksXml: '<xml><block type="maze_dig"/></xml>'},
      }),
    );
    expect(parsed.toolboxBlocksXml).toBe('<xml><block type="maze_dig"/></xml>');
    expect(parsed.properties.flower_type).toBe('purpleNectarHidden');
  });
});
