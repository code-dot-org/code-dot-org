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
  isDataShaped,
  keyRows,
  memberName,
  withKeyRows,
  type ActorData,
} from '../actorData';
import {STOCK_ACTORS} from '../stock';

describe('an actor’s own blocks and events', () => {
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
      [`scenario ${tag}`, projectFiles(scenario.source)] as [
        string,
        Record<string, string>,
      ],
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
  // A rename walks an actor's keys as the blocks they stand for and reads
  // them back (`blockly/rewriteWorkspaces`); reading back must lose nothing.
  it.each(stored)('%s reads every key back from its rows', (_, files) => {
    for (const [path, held] of Object.entries(files)) {
      if (path.endsWith('.actor')) {
        const data = JSON.parse(held) as ActorData;
        expect(withKeyRows(data, keyRows(data)), path).toEqual(data);
      }
    }
  });
});

describe('every actor, compiled', () => {
  it.each(PROJECTS)('%s compiles from its data', async (_, files) => {
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
      if (path.endsWith('.actor')) {
        expect(ref.current!.generate(written, path), path).toContain(
          'export default',
        );
      }
    }
    unmount();
  });

  it('refuses a file written in define actor rows', async () => {
    const ref = createRef<BlocklyGeneratorHandle>();
    const {unmount} = render(<BlocklyGenerator ref={ref} />);
    await new Promise(resolve => setTimeout(resolve, 0));
    const rows = JSON.stringify({
      blocks: {blocks: [{type: 'world_actor', fields: {NAME: 'Rock'}}]},
    });
    expect(() => ref.current!.generate(rows, 'actors/rock.actor')).toThrow(
      /not an actor's data/,
    );
    unmount();
  });
});
