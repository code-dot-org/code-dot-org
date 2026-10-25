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
import {SCENARIOS_AS_WRITTEN as WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {LESSONS} from '../../progression/lessons';
import {projectFiles} from '../../runtime/projectFiles';
import {
  actorView,
  asActorData,
  foldActor,
  isActorData,
  viewOf,
  type ActorData,
} from '../actorData';
import {STOCK_ACTORS} from '../stock';
import {
  actorFile,
  defineProperty,
  setText,
  swatch,
  useTrait,
} from '../stock/workspace';

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
    const contents = actorFile(
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

  it('keeps as setup what it cannot say as data', () => {
    // A second look, and a `set` of something computed.
    const computed = {
      type: 'world_set_ActorsLabel_SizeProperty',
      inputs: {
        ACTOR: {block: {type: 'world_this_actor'}},
        VALUE: {block: {type: 'math_random_float'}},
      },
    };
    const data = fold(
      actorFile('Odd', [
        {type: 'world_set_sprite', fields: {SPRITE: 'a.png'}},
        {type: 'world_set_sprite', fields: {SPRITE: 'b.png'}},
        computed,
      ]),
    );
    expect(data.animations).toEqual({
      Main: {loop: true, tracks: {sprite: [{at: 0, value: 'a.png'}]}},
    });
    expect(data.setup!.map(row => row.type)).toEqual([
      'world_set_sprite',
      'world_set_ActorsLabel_SizeProperty',
    ]);
    // …and the view puts them back.
    expect(fold(JSON.stringify(actorView(data)))).toEqual(data);
  });

  it('is nothing for a file with no define actor', () => {
    expect(foldActor({blocks: {blocks: []}})).toBeUndefined();
  });

  it('keeps the keys beside the workspace', () => {
    const file = {
      ...(JSON.parse(actorFile('Tag', [])) as object),
      for: 'interface',
      extra: 1,
    };
    const data = foldActor(file)!;
    expect(data.for).toBe('interface');
    expect(data.extra).toBe(1);
    expect(actorView(data)).toMatchObject({for: 'interface', extra: 1});
  });

  it('turns either shape into the other, and leaves each alone', () => {
    const contents = actorFile('Tag', [
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

    for (const [path, contents] of Object.entries(files)) {
      if (!path.endsWith('.actor')) {
        continue;
      }
      const data = fold(contents);
      expect(data, path).toBeDefined();
      // Every row a shipped actor holds is data or code; none is kept aside.
      expect(data.setup, path).toBeUndefined();
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
