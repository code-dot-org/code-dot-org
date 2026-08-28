import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {applyChange} from '@code-dot-org/authoring';

import type {CourseModel} from '../../authoring/model.js';
import type {MazeLevelDefinition} from '../../levels/mazeLevel.js';
import {EMPTY_SNAPSHOT, SessionStore} from '../../store/SessionStore.js';
import {AuthoringState} from '../AuthoringState.js';

let root: string;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'authoring-session-'));
});

afterEach(() => {
  fs.rmSync(root, {recursive: true, force: true});
});

function stateWithLevel(): AuthoringState {
  const level = {
    id: 'lb:some_maze_level',
    origin: 'levelbuilder' as const,
    kind: 'existingLevel' as const,
    levelKey: 'some_maze_level',
    levelType: 'Maze',
    runtime: 'labhost' as const,
    labKey: 'maze' as const,
    levelNumericId: 7,
  };
  const course: CourseModel = {
    id: 'course-1',
    displayName: 'Course One',
    origin: 'draft',
    units: [
      {
        id: 'unit-1',
        displayName: 'Unit One',
        origin: 'draft',
        lessons: [
          {
            id: 'lesson-1',
            displayName: 'Lesson One',
            origin: 'draft',
            experiences: [level],
          },
        ],
      },
    ],
  };
  const store = new SessionStore(root);
  return new AuthoringState({
    store,
    // The real reducer, not a stand-in — this test exists specifically to
    // exercise the levelProperties side effect layered on top of it.
    applyChange,
    snapshot: {
      ...EMPTY_SNAPSHOT,
      courses: [course],
      levelProperties: {
        '7': {
          id: 7,
          appName: 'maze',
          shortInstructions: 'Original short instructions.',
        },
      },
    },
    changes: [],
  });
}

describe('AuthoringState overrideLevelInstructions', () => {
  it('folds the override onto the served levelProperties entry', () => {
    const state = stateWithLevel();
    state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {shortInstructions: 'Reworded for 2nd grade.'},
      },
      'author',
    );

    const properties = state.getLevelProperties('7');
    expect(properties?.shortInstructions).toBe('Reworded for 2nd grade.');
    // Fields the override didn't touch survive untouched.
    expect(properties?.appName).toBe('maze');
  });

  it('records the override on the experience in the change log and outline', () => {
    const state = stateWithLevel();
    state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {longInstructions: 'Turn left, then walk to the goal.'},
      },
      'agent',
    );

    expect(state.getChanges()).toHaveLength(1);
    expect(state.getChanges()[0]).toMatchObject({
      op: 'overrideLevelInstructions',
      experienceId: 'lb:some_maze_level',
      actor: 'agent',
    });

    const experience = state.getSnapshot().courses[0].units[0].lessons[0]
      .experiences[0] as {instructionsOverride?: unknown};
    expect(experience.instructionsOverride).toEqual({
      longInstructions: 'Turn left, then walk to the goal.',
    });
  });

  it('bumps the version exactly once for one change', () => {
    const state = stateWithLevel();
    const versionBefore = state.version;
    state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {shortInstructions: 'x'},
      },
      'author',
    );
    expect(state.version).toBe(versionBefore + 1);
  });

  // buildMazeLevelProperties spreads a maze-family level's raw properties
  // (short_instructions) AND sets an explicit camelCase shortInstructions —
  // a served entry can carry both. Overriding the camel key must update the
  // snake twin too, or a stale short_instructions survives alongside the
  // fresh shortInstructions the author actually sees.
  it('keeps short_instructions in sync when shortInstructions is overridden', () => {
    const state = new AuthoringState({
      store: new SessionStore(root),
      applyChange,
      snapshot: {
        ...EMPTY_SNAPSHOT,
        courses: [
          {
            id: 'course-1',
            displayName: 'Course One',
            origin: 'draft',
            units: [
              {
                id: 'unit-1',
                displayName: 'Unit One',
                origin: 'draft',
                lessons: [
                  {
                    id: 'lesson-1',
                    displayName: 'Lesson One',
                    origin: 'draft',
                    experiences: [
                      {
                        id: 'lb:some_maze_level',
                        origin: 'levelbuilder',
                        kind: 'existingLevel',
                        levelKey: 'some_maze_level',
                        levelType: 'Maze',
                        runtime: 'labhost',
                        labKey: 'maze',
                        levelNumericId: 7,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        levelProperties: {
          '7': {
            id: 7,
            appName: 'maze',
            shortInstructions: 'Original short instructions.',
            short_instructions: 'Original short instructions.',
          },
        },
      },
      changes: [],
    });
    state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {shortInstructions: 'Reworded for 2nd grade.'},
      },
      'author',
    );

    const properties = state.getLevelProperties('7');
    expect(properties?.shortInstructions).toBe('Reworded for 2nd grade.');
    expect(properties?.short_instructions).toBe('Reworded for 2nd grade.');
  });
});

describe('AuthoringState overrideLevelInstructions previous capture', () => {
  it('captures the imported original as `previous` on the first override', () => {
    const state = stateWithLevel();
    const change = state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {shortInstructions: 'Reworded for 2nd grade.'},
      },
      'author',
    );
    expect(change).toMatchObject({
      previous: {shortInstructions: 'Original short instructions.'},
    });
  });

  it('captures the prior override as `previous` on a second override of the same field', () => {
    const state = stateWithLevel();
    state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {shortInstructions: 'First rewrite.'},
      },
      'author',
    );
    const second = state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {shortInstructions: 'Second rewrite.'},
      },
      'author',
    );
    expect(second).toMatchObject({
      previous: {shortInstructions: 'First rewrite.'},
    });
  });

  it('captures an empty string, not undefined, for a field that never had a value', () => {
    const state = stateWithLevel();
    const change = state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {longInstructions: 'Turn left, then walk to the goal.'},
      },
      'author',
    );
    expect(change).toMatchObject({previous: {longInstructions: ''}});
  });

  it('only captures the fields the patch itself touches', () => {
    const state = stateWithLevel();
    const change = state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {shortInstructions: 'Reworded.'},
      },
      'author',
    );
    expect(
      (change as {previous?: {longInstructions?: string}}).previous,
    ).not.toHaveProperty('longInstructions');
  });

  it('ignores a client-supplied `previous` and recomputes it authoritatively', () => {
    const state = stateWithLevel();
    const change = state.applyCurriculumChange(
      {
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {shortInstructions: 'Reworded.'},
        // Simulates a spoofed request body reaching applyCurriculumChange
        // directly — CurriculumChangeBodySchema would strip this in the real
        // POST /api/changes path, but the type itself allows it (it's the
        // same field the server stamps authoritatively below).
        previous: {shortInstructions: 'Attacker-supplied lie.'},
      },
      'author',
    );
    expect(change).toMatchObject({
      previous: {shortInstructions: 'Original short instructions.'},
    });
  });
});

function draftMazeDefinition(): MazeLevelDefinition {
  return {
    grid: [
      [0, 0, 0, 0],
      [0, 2, 1, 0],
      [0, 1, 3, 0],
      [0, 0, 0, 0],
    ],
    startDirection: 1,
    skin: 'birds',
    shortInstructions: 'Move to the goal.',
    idealBlockCount: 2,
    toolbox: ['moveForward', 'turnLeft', 'turnRight'],
    solution: [{type: 'moveForward'}],
  };
}

function stateWithDraftLevel(root: string): AuthoringState {
  const level = {
    id: 'draft-exp-1',
    origin: 'draft' as const,
    kind: 'existingLevel' as const,
    levelKey: 'draft:level-1',
    levelType: 'Maze',
    runtime: 'labhost' as const,
    labKey: 'maze' as const,
    levelNumericId: 9000001,
  };
  const course: CourseModel = {
    id: 'course-1',
    displayName: 'Course One',
    origin: 'draft',
    units: [
      {
        id: 'unit-1',
        displayName: 'Unit One',
        origin: 'draft',
        lessons: [
          {
            id: 'lesson-1',
            displayName: 'Lesson One',
            origin: 'draft',
            experiences: [level],
          },
        ],
      },
    ],
  };
  const store = new SessionStore(root);
  store.writeLevelDefinition('level-1', draftMazeDefinition());
  return new AuthoringState({
    store,
    applyChange,
    snapshot: {
      ...EMPTY_SNAPSHOT,
      courses: [course],
      levelProperties: {
        '9000001': {id: 9000001, appName: 'maze', startDirection: '1'},
      },
    },
    changes: [],
  });
}

describe('AuthoringState overrideLevelDefinition', () => {
  it('folds the override onto the served levelProperties entry', () => {
    const state = stateWithLevel();
    state.applyCurriculumChange(
      {
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {startDirection: '2'},
      },
      'author',
    );

    const properties = state.getLevelProperties('7');
    expect(properties?.startDirection).toBe('2');
    expect(properties?.appName).toBe('maze');
  });

  it('records the override on the experience in the change log and outline', () => {
    const state = stateWithLevel();
    state.applyCurriculumChange(
      {
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {startDirection: '3'},
      },
      'author',
    );

    expect(state.getChanges()).toHaveLength(1);
    expect(state.getChanges()[0]).toMatchObject({
      op: 'overrideLevelDefinition',
      experienceId: 'lb:some_maze_level',
      actor: 'author',
    });

    const experience = state.getSnapshot().courses[0].units[0].lessons[0]
      .experiences[0] as {definitionOverride?: unknown};
    expect(experience.definitionOverride).toEqual({startDirection: '3'});
  });

  // G1: buildMazeLevelProperties (packages/authoring/src/importer/
  // levelProperties.ts) sets both the raw `flower_type` and an explicit
  // camelCase `flowerType` on the served entry — Bee.ts (the only reader)
  // uses `flowerType` exclusively. The visualization panel's patch is keyed
  // `flower_type` (the raw wire name — see levelDraft.ts), so a merge that
  // writes only that key leaves `flowerType` at its stale import-time value
  // and the save never reaches the engine.
  it('keeps flower_type and flowerType in sync on the served entry', () => {
    const state = stateWithLevel();
    state.applyCurriculumChange(
      {
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {flower_type: 'redWithNectar'},
      },
      'author',
    );

    const properties = state.getLevelProperties('7');
    expect(properties?.flower_type).toBe('redWithNectar');
    expect(properties?.flowerType).toBe('redWithNectar');
  });

  it('deletes both flower_type and flowerType on a null (revert) patch', () => {
    const state = stateWithLevel();
    state.applyCurriculumChange(
      {
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {flower_type: 'redWithNectar'},
      },
      'author',
    );
    state.applyCurriculumChange(
      {
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {flower_type: null},
      },
      'author',
    );

    const properties = state.getLevelProperties('7');
    expect(properties).not.toHaveProperty('flower_type');
    expect(properties).not.toHaveProperty('flowerType');
  });
});

describe('AuthoringState overrideLevelDefinition previous capture', () => {
  it('captures the served value as `previous`', () => {
    const state = stateWithLevel();
    const change = state.applyCurriculumChange(
      {
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {startDirection: '2'},
      },
      'author',
    );
    // stateWithLevel's fixture never set startDirection, so the served
    // entry never had it — captured previous must be `null` (an explicit
    // delete-this-key signal), not `''`, so a revert removes the key rather
    // than writing a corrupt empty value.
    expect(change).toMatchObject({previous: {startDirection: null}});
  });

  it('captures the prior override as `previous` on a second override', () => {
    const state = stateWithLevel();
    state.applyCurriculumChange(
      {
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {startDirection: '1'},
      },
      'author',
    );
    const second = state.applyCurriculumChange(
      {
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {startDirection: '2'},
      },
      'author',
    );
    expect(second).toMatchObject({previous: {startDirection: '1'}});
  });

  // G1: flower_type needed no special-cased capture logic once it was added
  // to LevelDefinitionPatch — capturePreviousDefinition's generic
  // Object.keys(patch) loop (AuthoringState.ts) already covers any key the
  // schema accepts.
  it('captures the prior flower_type as `previous` on a second override, same as any other field', () => {
    const state = stateWithLevel();
    state.applyCurriculumChange(
      {
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {flower_type: 'redWithNectar'},
      },
      'author',
    );
    const second = state.applyCurriculumChange(
      {
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {flower_type: 'purpleNectarHidden'},
      },
      'author',
    );
    expect(second).toMatchObject({previous: {flower_type: 'redWithNectar'}});
  });

  it('ignores a client-supplied `previous` and recomputes it authoritatively', () => {
    const state = stateWithLevel();
    const change = state.applyCurriculumChange(
      {
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {startDirection: '2'},
        previous: {startDirection: 'attacker-supplied lie'},
      },
      'author',
    );
    expect(change).toMatchObject({previous: {startDirection: null}});
  });
});

describe('AuthoringState overrideLevelDefinition solution staleness', () => {
  it('degrades solutionVerified to false when a map edit carries no fresh proof', () => {
    const state = stateWithLevel();
    state.applyCurriculumChange(
      {
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {solutionBlocksXml: '<xml/>', solutionVerified: 'true'},
      },
      'author',
    );
    const change = state.applyCurriculumChange(
      {
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {serialized_maze: '[[]]', maze: '[[]]'},
      },
      'author',
    );

    expect(state.getLevelProperties('7')?.solutionVerified).toBe('false');
    // The forced 'false' is part of the applied patch (not just the merge
    // result) — the change log itself shows the map edit invalidated the
    // solution, and `previous` records the prior 'true' so a revert of this
    // change restores it.
    expect(change).toMatchObject({
      patch: {solutionVerified: 'false'},
      previous: {solutionVerified: 'true'},
    });
  });

  it('does not touch solutionVerified when the patch does not touch the environment', () => {
    const state = stateWithLevel();
    state.applyCurriculumChange(
      {
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {solutionBlocksXml: '<xml/>', solutionVerified: 'true'},
      },
      'author',
    );
    state.applyCurriculumChange(
      {
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {ideal: '5'},
      },
      'author',
    );

    expect(state.getLevelProperties('7')?.solutionVerified).toBe('true');
  });

  it('honors an explicit solutionVerified in the same patch as an environment change', () => {
    const state = stateWithLevel();
    const change = state.applyCurriculumChange(
      {
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {
          serialized_maze: '[[]]',
          maze: '[[]]',
          solutionBlocksXml: '<xml/>',
          solutionVerified: 'true',
        },
      },
      'author',
    );

    expect(state.getLevelProperties('7')?.solutionVerified).toBe('true');
    expect(change).toMatchObject({patch: {solutionVerified: 'true'}});
  });
});

describe('AuthoringState overrideLevelDefinition draft-level guard', () => {
  it('flags a draft level as visuallyEdited on the stored definition', () => {
    const state = stateWithDraftLevel(root);
    state.applyCurriculumChange(
      {
        op: 'overrideLevelDefinition',
        experienceId: 'draft-exp-1',
        patch: {startDirection: '2'},
      },
      'author',
    );
    const store = new SessionStore(root);
    const definition = store.readLevelDefinition('level-1');
    expect(definition?.visuallyEdited).toBe(true);
    // Not clobbered — the rest of the stored definition survives.
    expect(definition?.idealBlockCount).toBe(2);
  });

  it('leaves an imported level untouched (no on-disk definition to flag)', () => {
    const state = stateWithLevel();
    // stateWithLevel's fixture is lb:some_maze_level — no draft level.json
    // exists for it, so markDraftLevelVisuallyEdited must no-op rather than
    // throw.
    expect(() =>
      state.applyCurriculumChange(
        {
          op: 'overrideLevelDefinition',
          experienceId: 'lb:some_maze_level',
          patch: {startDirection: '2'},
        },
        'author',
      ),
    ).not.toThrow();
  });
});

function stateWithWidget(): AuthoringState {
  const store = new SessionStore(root);
  return new AuthoringState({
    store,
    applyChange,
    snapshot: {
      ...EMPTY_SNAPSHOT,
      widgets: [
        {
          id: 'widget-1',
          toolName: 'widget_1',
          title: 'Original title',
          description: 'Original description',
          inputSchema: {},
          resourceUri: 'ui://widget-1',
          visibility: ['model', 'app'],
          network: 'none',
        },
      ],
    },
    changes: [],
  });
}

describe('AuthoringState updateWidgetMetadata previous capture', () => {
  it('captures the prior title/description as `previous`', () => {
    const state = stateWithWidget();
    const change = state.applyCurriculumChange(
      {
        op: 'updateWidgetMetadata',
        widgetId: 'widget-1',
        patch: {title: 'New title', description: 'New description'},
      },
      'author',
    );

    expect(change).toMatchObject({
      previous: {
        title: 'Original title',
        description: 'Original description',
      },
    });
    expect(state.getSnapshot().widgets[0]).toMatchObject({
      title: 'New title',
      description: 'New description',
    });
  });

  it('captures only the patched fields, not the whole descriptor', () => {
    const state = stateWithWidget();
    const change = state.applyCurriculumChange(
      {op: 'updateWidgetMetadata', widgetId: 'widget-1', patch: {title: 'New title'}},
      'author',
    );

    expect(change).toMatchObject({previous: {title: 'Original title'}});
    expect(
      (change as {previous?: {description?: string}}).previous?.description,
    ).toBeUndefined();
  });

  it('ignores a client-supplied `previous` and recomputes it authoritatively', () => {
    const state = stateWithWidget();
    const change = state.applyCurriculumChange(
      {
        op: 'updateWidgetMetadata',
        widgetId: 'widget-1',
        patch: {title: 'New title'},
        previous: {title: 'Attacker-supplied lie'},
      },
      'author',
    );

    expect(change).toMatchObject({previous: {title: 'Original title'}});
  });
});

function stateWithWidgetExperience(): AuthoringState {
  const store = new SessionStore(root);
  const course: CourseModel = {
    id: 'course-1',
    displayName: 'Course One',
    origin: 'draft',
    units: [
      {
        id: 'unit-1',
        displayName: 'Unit One',
        origin: 'draft',
        lessons: [
          {
            id: 'lesson-1',
            displayName: 'Lesson One',
            origin: 'draft',
            experiences: [
              {
                id: 'exp-widget',
                origin: 'draft',
                kind: 'widget',
                widgetId: 'draft-widget-1',
                toolName: 'thing',
              },
            ],
          },
        ],
      },
    ],
  };
  return new AuthoringState({
    store,
    applyChange,
    snapshot: {...EMPTY_SNAPSHOT, courses: [course]},
    changes: [],
  });
}

describe('AuthoringState adoptCatalogWidget previous capture', () => {
  it('captures null as `previous` for a widget never adopted before', () => {
    const state = stateWithWidgetExperience();
    const change = state.applyCurriculumChange(
      {
        op: 'adoptCatalogWidget',
        experienceId: 'exp-widget',
        catalogRef: {slug: 'you-be-the-sorter', version: '1.0.0'},
      },
      'author',
    );

    expect(change).toMatchObject({previous: null});
    const experience = state.getSnapshot().courses[0].units[0].lessons[0]
      .experiences[0];
    expect(experience).toMatchObject({
      widgetId: 'draft-widget-1', // unchanged
      catalogRef: {slug: 'you-be-the-sorter', version: '1.0.0'},
    });
  });

  it('captures the prior catalogRef as `previous` on a second adoption, and a null catalogRef reverts it', () => {
    const state = stateWithWidgetExperience();
    state.applyCurriculumChange(
      {
        op: 'adoptCatalogWidget',
        experienceId: 'exp-widget',
        catalogRef: {slug: 'you-be-the-sorter', version: '1.0.0'},
      },
      'author',
    );
    const bump = state.applyCurriculumChange(
      {
        op: 'adoptCatalogWidget',
        experienceId: 'exp-widget',
        catalogRef: {slug: 'you-be-the-sorter', version: '1.1.0'},
      },
      'author',
    );
    expect(bump).toMatchObject({
      previous: {slug: 'you-be-the-sorter', version: '1.0.0'},
    });

    const reverted = state.applyCurriculumChange(
      {op: 'adoptCatalogWidget', experienceId: 'exp-widget', catalogRef: null},
      'author',
    );
    expect(reverted).toMatchObject({
      previous: {slug: 'you-be-the-sorter', version: '1.1.0'},
    });
    const experience = state.getSnapshot().courses[0].units[0].lessons[0]
      .experiences[0];
    expect((experience as {catalogRef?: unknown}).catalogRef).toBeUndefined();
  });

  it('ignores a client-supplied `previous` and recomputes it authoritatively', () => {
    const state = stateWithWidgetExperience();
    const change = state.applyCurriculumChange(
      {
        op: 'adoptCatalogWidget',
        experienceId: 'exp-widget',
        catalogRef: {slug: 'you-be-the-sorter', version: '1.0.0'},
        previous: {slug: 'attacker-supplied-lie', version: '9.9.9'},
      },
      'author',
    );
    expect(change).toMatchObject({previous: null});
  });
});
