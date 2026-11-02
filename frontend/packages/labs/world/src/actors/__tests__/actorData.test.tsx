// An actor as data and events (specs/ACTOR_EDITOR_PLAN.md, step 1).

import {render} from '@testing-library/react';
import {createRef} from 'react';
import {describe, expect, it} from 'vitest';

import BlocklyGenerator, {
  type BlocklyGeneratorHandle,
} from '../../blockly/BlocklyGenerator';
import {refreshProjectDropdowns} from '../../blockly/projectDropdowns';
import {projectOwnMetas, projectRuleMetas} from '../../blockly/projectModules';
import {registerProjectRules} from '../../blockly/ruleRegistry';
import {DEFAULT_PROJECT} from '../../constants';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {LESSONS} from '../../progression/lessons';
import {projectFiles} from '../../runtime/projectFiles';
import {
  actorView,
  asActorData,
  foldActor,
  CREATED_HAT,
  isActorData,
  isDataShaped,
  memberName,
  viewOf,
  type ActorData,
} from '../actorData';
import {STOCK_ACTORS} from '../stock';
import {chain, drawingRow, setText, swatch} from '../stock/workspace';

// The rows a `define actor` is written in, which the fold reads.
const useTrait = (trait: string) => ({
  type: 'world_use_trait',
  fields: {TRAIT: trait},
});
const defineProperty = (type: string, name: string, value?: string) => ({
  type: 'world_rule_property',
  fields: {
    TYPE: type,
    ACCESS: 'writable',
    NAME: name,
    ...(value === undefined ? {} : {DEFAULT: value}),
  },
});
const actorRows = (
  name: string,
  rows: object[],
  extras: {
    drawing?: Parameters<typeof drawingRow>[0];
    handlers?: object[];
  } = {},
): string =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          x: 20,
          y: 20,
          fields: {NAME: name},
          ...(rows.length || extras.drawing
            ? {
                next: {
                  block: chain([
                    ...rows,
                    ...(extras.drawing ? [drawingRow(extras.drawing)] : []),
                  ]),
                },
              }
            : {}),
        },
        ...(extras.handlers ?? []).map((handler, index) => ({
          ...handler,
          x: 20,
          y: 60 + index * 40,
        })),
      ],
    },
  });

/** The types down a hat's chain, top to bottom. */
const chainTypes = (hat: Record<string, unknown>): string[] => {
  const types: string[] = [];
  let row = (hat.next as {block?: {type: string; next?: unknown}})?.block;
  while (row) {
    types.push(row.type);
    row = (row.next as {block?: {type: string; next?: unknown}})?.block;
  }
  return types;
};

const fold = (contents: string): ActorData =>
  foldActor(JSON.parse(contents) as Record<string, unknown>)!;

/**
 * The lines a module holds, in no order: the view sorts rows. A block saved
 * without an id is given a random one each time it is loaded, and a few
 * generators write theirs into the code (a loop's step, an added actor's
 * placement), so those are masked: generating one file twice differs there.
 */
const lines = (code: string): string[] =>
  code
    .replace(/"[^"\s]{20}"/g, '"ID"')
    .replace(/\b\w{16,}_step\b/g, 'ID_step')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .sort();

describe('an actor folded into data', () => {
  it('says what the actor is as keys, and keeps its code as roots', () => {
    const contents = actorRows(
      'Badge',
      [
        useTrait('Gravity#AffectedByGravityTrait'),
        {type: 'world_show_as', fields: {ICON: 'star'}},
        defineProperty('number', 'lives', '3'),
        setText('ColorProperty', swatch('#ff0000')),
        {type: 'world_set_sprite', fields: {SPRITE: 'badge.png'}},
      ],
      {
        drawing: {
          width: 10,
          height: 10,
          commands: [{type: 'world_print', inputs: {}}],
        },
      },
    );
    const data = fold(contents);

    expect(data).toMatchObject({
      type: 'actor',
      name: 'Badge',
      icon: 'star',
      // A still picture is the Main animation (specs/ANIMATION_PLAN.md).
      animations: {
        Main: {loop: true, tracks: {sprite: [{at: 0, value: 'badge.png'}]}},
      },
      traits: ['Gravity#AffectedByGravityTrait'],
      properties: [
        {name: 'lives', type: 'number', access: 'writable', value: '3'},
      ],
      values: [
        {
          setter: 'world_set_ActorsLabel_ColorProperty',
          type: 'color',
          value: '#ff0000',
        },
      ],
    });
    expect(data.blocks!.blocks!.blocks!.map(block => block.type)).toEqual([
      'world_define_drawing',
    ]);
    expect(isActorData(data)).toBe(true);
  });

  it('makes what it cannot say as data its creation handler', () => {
    // A second look, and a `set` of something computed: what the actor does
    // on being made (specs/ACTORS_AS_DATA_PLAN.md, step 2).
    const computed = {
      type: 'world_set_ActorsLabel_SizeProperty',
      inputs: {
        ACTOR: {block: {type: 'world_this_actor'}},
        VALUE: {block: {type: 'math_random_float'}},
      },
    };
    const data = fold(
      actorRows('Odd', [
        {type: 'world_set_sprite', fields: {SPRITE: 'a.png'}},
        {type: 'world_set_sprite', fields: {SPRITE: 'b.png'}},
        computed,
      ]),
    );
    expect(data.animations).toEqual({
      Main: {loop: true, tracks: {sprite: [{at: 0, value: 'a.png'}]}},
    });
    const [hat] = data.blocks!.blocks!.blocks!;
    expect(hat.type).toBe(CREATED_HAT);
    expect(chainTypes(hat)).toEqual([
      'world_set_sprite',
      'world_set_ActorsLabel_SizeProperty',
    ]);
    // …and the view, folded again, is the same data.
    expect(fold(JSON.stringify(actorView(data)))).toEqual(data);
  });

  it('puts them first in the creation handler it already has', () => {
    const workspace = JSON.parse(
      actorRows('Odd', [
        {type: 'world_set_sprite', fields: {SPRITE: 'a.png'}},
        {type: 'world_set_sprite', fields: {SPRITE: 'b.png'}},
      ]),
    ) as {blocks: {blocks: object[]}};
    workspace.blocks.blocks.push({
      type: CREATED_HAT,
      x: 300,
      y: 20,
      next: {block: {type: 'world_say', next: {block: {type: 'world_wait'}}}},
    });
    const data = foldActor(workspace)!;
    const hats = data.blocks!.blocks!.blocks!.filter(
      root => root.type === CREATED_HAT,
    );
    expect(hats).toHaveLength(1);
    expect(hats[0]).toMatchObject({x: 300, y: 20});
    expect(chainTypes(hats[0])).toEqual([
      'world_set_sprite',
      'world_say',
      'world_wait',
    ]);
  });

  it('drops a declaration the data already makes', () => {
    // A second `acts like` says nothing the first does not, and means
    // nothing in a handler.
    const data = fold(
      actorRows('Odd', [
        {type: 'world_acts_like', fields: {ACTOR: 'actors/label'}},
        {type: 'world_acts_like', fields: {ACTOR: 'actors/panel'}},
      ]),
    );
    expect(data.actsLike).toBe('actors/label');
    expect(data.blocks!.blocks!.blocks).toEqual([]);
  });

  it('keeps a picture value as data, and writes it back', () => {
    const data = fold(
      actorRows('Card', [
        {
          type: 'world_set_Card_FaceProperty',
          inputs: {
            ACTOR: {block: {type: 'world_this_actor'}},
            VALUE: {
              shadow: {type: 'world_picture', fields: {SPRITE: 'ace.png'}},
            },
          },
        },
      ]),
    );
    expect(data.values).toEqual([
      {
        setter: 'world_set_Card_FaceProperty',
        type: 'picture',
        value: 'ace.png',
      },
    ]);
    expect(fold(JSON.stringify(actorView(data)))).toEqual(data);
  });

  it('is nothing for a file with no define actor', () => {
    expect(foldActor({blocks: {blocks: []}})).toBeUndefined();
  });

  it('keeps the keys beside the workspace', () => {
    const file = {
      ...(JSON.parse(actorRows('Tag', [])) as object),
      for: 'interface',
      extra: 1,
    };
    const data = foldActor(file)!;
    expect(data.for).toBe('interface');
    expect(data.extra).toBe(1);
    expect(actorView(data)).toMatchObject({for: 'interface', extra: 1});
  });

  it('turns either shape into the other, and leaves each alone', () => {
    const contents = actorRows('Tag', [
      useTrait('Gravity#AffectedByGravityTrait'),
    ]);
    const data = asActorData(contents);
    expect(JSON.parse(data).type).toBe('actor');
    expect(asActorData(data)).toBe(data);
    expect(viewOf(contents)).toBe(contents);
    expect(fold(viewOf(data))).toEqual(JSON.parse(data));
    expect(viewOf('not json')).toBe('not json');
  });
});

describe('an actor’s own blocks and events, folded', () => {
  const stock = (id: string) =>
    JSON.parse(
      STOCK_ACTORS.find(actor => actor.id === id)!.contents,
    ) as ActorData;
  const codeTypes = (data: ActorData) =>
    (data.blocks?.blocks?.blocks ?? []).map(root => root.type);

  it('makes a declared event a member, and no root of the code', () => {
    const data = stock('toggle');

    expect(data.members?.map(member => member.kind)).toEqual([
      'event',
      'event',
    ]);
    expect(codeTypes(data)).not.toContain('world_rule_event');
  });

  it('keeps words and values in order', () => {
    const data = stock('list');
    const events = data.members!.filter(member => member.kind === 'event');

    expect(
      events.map(event =>
        event.parts.map(part =>
          part.kind === 'label'
            ? part.text
            : part.kind === 'row'
              ? '|'
              : `[${String(part.name)}]`,
        ),
      ),
    ).toEqual([
      ['is chosen', '[word]', 'at', '[place]'],
      ['loses', '[word]', 'at', '[place]'],
    ]);
  });

  it('keeps a block’s description, its eye and what it does', () => {
    const data = stock('textArea');
    const blocks = data.members!.filter(member => member.kind === 'block');

    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks.some(block => block.hidden)).toBe(true);
    expect(blocks.every(block => block.description)).toBe(true);
    expect(blocks.every(block => block.body?.type)).toBe(true);
    expect(codeTypes(data)).not.toContain('world_rule_block');
  });

  it('views and folds back to the same members, ids and all', () => {
    for (const id of ['toggle', 'list', 'textArea']) {
      const data = stock(id);
      expect(fold(JSON.stringify(actorView(data))), id).toEqual(data);
    }
  });

  it('names a member on the trail by its words', () => {
    const contents = JSON.stringify(stock('toggle'));
    const [first] = stock('toggle').members!;
    expect(memberName(contents, first.id)).toBe('turned on');
    expect(
      memberName(
        JSON.stringify({
          ...stock('toggle'),
          members: [{id: 'm', kind: 'block', parts: []}],
        }),
        'm',
      ),
    ).toBe('New block');
  });

  it('holds a block that reports a value as a member', () => {
    // It compiles to nothing in an actor yet (`actorSheet`), but the data
    // says it, so nothing an actor's code holds is a `define block`.
    const data = fold(
      actorRows('Asker', [
        {
          type: 'world_rule_block',
          fields: {RETURNS: 'number', DESCRIPTION: '', ACCESS: 'shared'},
          extraState: {parts: [{kind: 'label', text: 'how far'}]},
        },
      ]),
    );

    expect(data.members?.[0]).toMatchObject({kind: 'block', returns: 'number'});
    expect(codeTypes(data)).not.toContain('world_rule_block');
  });
});

// Every actor the lab ships or teaches with: the stock library, each
// scenario's project, and each lesson's.
const PROJECTS: Array<[string, Record<string, string>]> = [
  [
    'stock',
    Object.fromEntries(
      STOCK_ACTORS.map(actor => [`actors/${actor.id}.actor`, actor.contents]),
    ),
  ],
  ...Object.entries(WORLD_SCENARIOS).map(
    ([tag, scenario]) =>
      // As blocks: the default project, which `simple` is, ships its actors
      // as data already.
      [
        `scenario ${tag}`,
        Object.fromEntries(
          Object.entries(projectFiles(scenario.source)).map(([path, held]) => [
            path,
            viewOf(held),
          ]),
        ),
      ] as [string, Record<string, string>],
  ),
  ...Object.entries(LESSONS).map(
    ([id, lesson]) =>
      [`lesson ${id}`, projectFiles(lesson.source)] as [
        string,
        Record<string, string>,
      ],
  ),
];

describe('every actor the lab ships or teaches with', () => {
  const stored: Array<[string, Record<string, string>]> = [
    PROJECTS[0],
    ['default', projectFiles(DEFAULT_PROJECT.source)],
    ...Object.entries(WORLD_SCENARIOS).map(
      ([tag, scenario]) =>
        [`scenario ${tag}`, projectFiles(scenario.source)] as [
          string,
          Record<string, string>,
        ],
    ),
    ...PROJECTS.filter(([tag]) => tag.startsWith('lesson ')),
  ];

  it.each(stored)('%s is stored as data', (_, files) => {
    for (const [path, held] of Object.entries(files)) {
      if (path.endsWith('.actor')) {
        expect(isDataShaped(held), path).toBe(true);
      }
    }
  });
});

describe('every actor, folded and viewed again', () => {
  it.each(PROJECTS)('%s compiles to the same lines', async (_, files) => {
    refreshProjectDropdowns(files, [], {}, []);
    const metas = projectRuleMetas(files);
    registerProjectRules(metas);
    const ref = createRef<BlocklyGeneratorHandle>();
    const {unmount} = render(
      <BlocklyGenerator
        ref={ref}
        projectRules={metas}
        ownProperties={projectOwnMetas(files)}
        blocklyFiles={files}
      />,
    );
    await new Promise(resolve => setTimeout(resolve, 0));

    for (const [path, written] of Object.entries(files)) {
      if (!path.endsWith('.actor')) {
        continue;
      }
      // Stored as data, so it starts from its view.
      const held = JSON.parse(written) as unknown;
      const contents = isActorData(held)
        ? JSON.stringify(actorView(held))
        : written;
      const data = fold(contents);
      expect(data, path).toBeDefined();
      // Every row a shipped actor holds is data or code; none is moved to
      // a creation handler, so the code it compiles to is the same.
      expect(
        (data.blocks?.blocks?.blocks ?? []).filter(
          root => root.type === CREATED_HAT,
        ).length,
        path,
      ).toBe(
        (
          JSON.parse(contents) as {blocks: {blocks: Array<{type: string}>}}
        ).blocks.blocks.filter(root => root.type === CREATED_HAT).length,
      );
      // The data, viewed and folded again, is the same data.
      expect(fold(JSON.stringify(actorView(data))), path).toEqual(data);
      const before = ref.current!.generate(contents, path);
      const after = ref.current!.generate(
        JSON.stringify(actorView(data)),
        path,
      );
      const a = lines(after);
      const b = lines(before);
      expect(a, path).toEqual(b);
    }
    unmount();
  });
});
