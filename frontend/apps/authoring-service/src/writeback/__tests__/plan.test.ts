import {createHash} from 'node:crypto';
import {describe, expect, it} from 'vitest';

import {buildNewLevelFile, parseLevelXml, patchLevelFile} from '@code-dot-org/authoring';

import type {
  BuildNewLevelFile,
  CourseModel,
  CurriculumChange,
  ExistingLevelExperience,
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
const buildNewLevelFileBridged = buildNewLevelFile as unknown as BuildNewLevelFile;

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

/** A course tree with one draft-origin Maze experience — createMazeLevel.ts's
 * own shape (levelKey `draft:...`, levelType 'Maze', a numeric id). */
function draftCourse(
  experienceId: string,
  title: string,
  levelNumericId = 1,
  levelType = 'Maze',
): CourseModel {
  const experience: ExistingLevelExperience = {
    id: experienceId,
    origin: 'draft',
    kind: 'existingLevel',
    title,
    levelKey: `draft:${experienceId}`,
    levelType,
    runtime: 'labhost',
    labKey: 'maze',
    levelNumericId,
  };
  return {
    id: 'c',
    displayName: 'Course',
    origin: 'draft',
    units: [
      {
        id: 'u',
        displayName: 'Unit',
        origin: 'draft',
        lessons: [
          {
            id: 'l',
            displayName: 'Lesson',
            origin: 'draft',
            experiences: [experience],
          },
        ],
      },
    ],
  };
}

function createLevelChange(
  experience: ExistingLevelExperience,
  lessonId = 'l',
  seq = 1,
): CurriculumChange {
  return {
    seq,
    at: new Date().toISOString(),
    actor: 'author',
    op: 'createLevel',
    lessonId,
    position: 0,
    level: experience,
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

  it('reports updateGenericLevelData as skipped rather than silently dropping it', () => {
    const changes: CurriculumChange[] = [
      {
        seq: 1,
        at: new Date().toISOString(),
        actor: 'author',
        op: 'updateGenericLevelData',
        experienceId: 'lb:courseD_maze_ramp1_2024',
        data: {type: 'video', videoKey: 'x', youtubeCode: 'dQw4w9WgXcQ'},
      },
    ];
    const plan = buildWritebackPlan(baseInput({changes}));
    expect(plan.edits).toHaveLength(0);
    expect(plan.skipped).toEqual([
      {
        experienceId: 'lb:courseD_maze_ramp1_2024',
        field: 'data',
        reason: 'generic-data-not-writeback-supported',
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

describe('buildWritebackPlan: createLevel', () => {
  const SERVED_PROPERTIES = {
    id: 7,
    appName: 'maze',
    type: 'Maze',
    name: 'draft:draft-exp-1',
    skin: 'birds',
    maze: '[[2,1,3]]',
    start_direction: '1',
    short_instructions: 'Move forward to reach the goal.',
    shortInstructions: 'Move forward to reach the goal.',
    ideal: '1',
    startBlocksXml:
      '<xml><block type="when_run" deletable="false" movable="false"></block></xml>',
    toolboxBlocksXml: '<xml><block type="maze_moveForward"/></xml>',
    solutionBlocksXml:
      '<xml><block type="when_run" deletable="false" movable="false">' +
      '<next><block type="maze_moveForward"/></next></block></xml>',
  };

  function createInput(overrides: Partial<WritebackPlanInput> = {}): WritebackPlanInput {
    return baseInput({
      courses: [draftCourse('draft-exp-1', 'My New Maze Level')],
      changes: [createLevelChange(draftCourse('draft-exp-1', 'My New Maze Level').units[0].lessons[0].experiences[0] as ExistingLevelExperience)],
      levelProperties: {'1': SERVED_PROPERTIES},
      buildNewLevelFile: buildNewLevelFileBridged,
      listAllLevelFileNames: () => new Set<string>(),
      ...overrides,
    });
  }

  it('produces a create entry sourced from the served levelProperties, named after the title', () => {
    const plan = buildWritebackPlan(createInput());
    expect(plan.skipped).toEqual([]);
    expect(plan.edits).toHaveLength(1);
    const edit = plan.edits[0];
    expect(edit.kind).toBe('create');
    if (edit.kind !== 'create') throw new Error('unreachable');
    expect(edit.name).toBe('My New Maze Level');
    expect(edit.path).toBe('dashboard/config/levels/custom/maze/My New Maze Level.level');
    expect(edit.experienceId).toBe('draft-exp-1');

    const parsed = parseLevelXml(edit.after);
    expect(parsed.levelType).toBe('Maze');
    expect(parsed.properties).toEqual({
      skin: 'birds',
      maze: '[[2,1,3]]',
      start_direction: '1',
      short_instructions: 'Move forward to reach the goal.',
      ideal: '1',
    });
    expect(parsed.startBlocksXml).toBe(SERVED_PROPERTIES.startBlocksXml);
    expect(parsed.toolboxBlocksXml).toBe(SERVED_PROPERTIES.toolboxBlocksXml);
    expect(parsed.solutionBlocksXml).toBe(SERVED_PROPERTIES.solutionBlocksXml);
    // Wire-only fields never leak into the file.
    expect(parsed.config).not.toHaveProperty('id');
    expect(parsed.config).not.toHaveProperty('appName');
    expect(parsed.properties).not.toHaveProperty('shortInstructions');
  });

  it('produces no entry, and no skip, for a createLevel op whose experience was removed (scratch level, never truly attached)', () => {
    const plan = buildWritebackPlan(
      createInput({courses: [{id: 'c', displayName: 'Course', origin: 'draft', units: []}]}),
    );
    expect(plan.edits).toHaveLength(0);
    expect(plan.skipped).toEqual([]);
  });

  it('bumps the algorithmic default name against the on-disk corpus, not the client', () => {
    const plan = buildWritebackPlan(
      createInput({listAllLevelFileNames: () => new Set(['my new maze level'])}),
    );
    expect(plan.edits).toHaveLength(1);
    const edit = plan.edits[0];
    if (edit.kind !== 'create') throw new Error('unreachable');
    expect(edit.name).toBe('My New Maze Level 2');
  });

  it('bumps two same-titled drafts against each other in one plan, not just against disk', () => {
    const experienceA = draftCourse('draft-exp-1', 'Same Title', 1).units[0].lessons[0]
      .experiences[0] as ExistingLevelExperience;
    const experienceB = draftCourse('draft-exp-2', 'Same Title', 2).units[0].lessons[0]
      .experiences[0] as ExistingLevelExperience;
    const course: CourseModel = {
      id: 'c',
      displayName: 'Course',
      origin: 'draft',
      units: [
        {
          id: 'u',
          displayName: 'Unit',
          origin: 'draft',
          lessons: [
            {id: 'l', displayName: 'Lesson', origin: 'draft', experiences: [experienceA, experienceB]},
          ],
        },
      ],
    };
    const plan = buildWritebackPlan(
      createInput({
        courses: [course],
        changes: [createLevelChange(experienceA), createLevelChange(experienceB, 'l', 2)],
        levelProperties: {'1': SERVED_PROPERTIES, '2': {...SERVED_PROPERTIES, name: 'draft:draft-exp-2'}},
      }),
    );
    expect(plan.edits).toHaveLength(2);
    const names = plan.edits.map(e => (e.kind === 'create' ? e.name : undefined)).sort();
    expect(names).toEqual(['Same Title', 'Same Title 2']);
  });

  it('validates rather than silently rewrites an author-edited name, rejecting a collision', () => {
    const plan = buildWritebackPlan(
      createInput({
        nameOverrides: {'draft-exp-1': 'Existing Level'},
        listAllLevelFileNames: () => new Set(['existing level']),
      }),
    );
    expect(plan.edits).toHaveLength(0);
    expect(plan.skipped).toHaveLength(1);
    expect(plan.skipped[0].field).toBe('name');
    expect(plan.skipped[0].reason).toMatch(/already exists/);
  });

  it('rejects an author-edited name containing a slash rather than sanitizing it', () => {
    const plan = buildWritebackPlan(
      createInput({nameOverrides: {'draft-exp-1': '../../etc/passwd'}}),
    );
    expect(plan.edits).toHaveLength(0);
    expect(plan.skipped[0].reason).toMatch(/slash/);
  });

  it('accepts a valid author-edited name verbatim', () => {
    const plan = buildWritebackPlan(
      createInput({nameOverrides: {'draft-exp-1': 'A Custom Name'}}),
    );
    expect(plan.edits).toHaveLength(1);
    const edit = plan.edits[0];
    if (edit.kind !== 'create') throw new Error('unreachable');
    expect(edit.name).toBe('A Custom Name');
    expect(edit.path).toBe('dashboard/config/levels/custom/maze/A Custom Name.level');
  });

  it('skips a non-Maze draft level type as out of this pass\'s scope', () => {
    const plan = buildWritebackPlan(
      createInput({
        courses: [draftCourse('draft-exp-1', 'A Fish level', 1, 'Fish')],
        changes: [
          createLevelChange(
            draftCourse('draft-exp-1', 'A Fish level', 1, 'Fish').units[0].lessons[0]
              .experiences[0] as ExistingLevelExperience,
          ),
        ],
      }),
    );
    expect(plan.edits).toHaveLength(0);
    expect(plan.skipped).toHaveLength(1);
    expect(plan.skipped[0].reason).toMatch(/Maze-family/);
  });

  it('does not also emit the generic "draft (non-lb) level" skip for a level this session created', () => {
    const experience = draftCourse('draft-exp-1', 'My New Maze Level').units[0].lessons[0]
      .experiences[0] as ExistingLevelExperience;
    const plan = buildWritebackPlan(
      createInput({
        changes: [
          createLevelChange(experience),
          {
            seq: 2,
            at: new Date().toISOString(),
            actor: 'author',
            op: 'overrideLevelInstructions',
            experienceId: 'draft-exp-1',
            patch: {shortInstructions: 'Updated.'},
            previous: {shortInstructions: 'Move forward to reach the goal.'},
          },
        ],
      }),
    );
    // One create entry; no "draft (non-lb) level, out of scope" noise.
    expect(plan.edits).toHaveLength(1);
    expect(plan.skipped).toEqual([]);
  });
});
