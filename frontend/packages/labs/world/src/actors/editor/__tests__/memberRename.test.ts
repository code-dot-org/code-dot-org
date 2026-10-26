// An actor's own event or block, renamed or deleted across the project
// (specs/ACTOR_BLOCKS_PLAN.md, step 4).

import {describe, expect, it} from 'vitest';

import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';

import type {ActorMember} from '../../actorData';
import {
  memberKey,
  memberTypes,
  memberUses,
  renameMember,
} from '../memberRename';

const file = (id: string, name: string, contents: unknown): ProjectFile => ({
  id,
  name,
  folderId: 'actors',
  language: 'actor',
  contents: JSON.stringify(contents),
});

const hurt: ActorMember = {
  id: 'event-1',
  kind: 'event',
  parts: [
    {kind: 'label', text: 'is hurt by'},
    {kind: 'param', type: 'number', var: '', name: 'amount'},
    {kind: 'label', text: 'from'},
    {kind: 'param', type: 'actor', var: '', name: 'who'},
  ],
};

const heal: ActorMember = {
  id: 'block-1',
  kind: 'block',
  parts: [
    {kind: 'label', text: 'heal by'},
    {kind: 'param', type: 'number', var: 'v-a', name: 'amount'},
  ],
};

const HAT = 'world_on_ActorsHero_IsHurtByFromEvent';
const EMIT = 'world_emit_ActorsHero_IsHurtByFromEvent';
const CALL = 'world_do_ActorsHero_HealByAction';

const getter = (id: string) => ({
  type: 'variables_get_Number',
  fields: {VAR: {id}},
});

/**
 * A Hero that is hurt and healed, and a world that hears the one and calls
 * the other, reading `amount` in the handler and in a step of its own.
 */
const project = (): MultiFileSource => ({
  folders: {actors: {id: 'actors', name: 'actors', parentId: '0', open: true}},
  files: {
    h: file('h', 'hero.actor', {
      type: 'actor',
      name: 'Hero',
      members: [hurt, heal],
      blocks: {blocks: {languageVersion: 0, blocks: []}},
    }),
    w: file('w', 'main.world', {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: HAT,
            next: {
              block: {
                type: 'world_print',
                inputs: {TEXT: {block: getter('v1')}},
                next: {
                  block: {
                    type: EMIT,
                    inputs: {AMOUNT: {block: getter('v1')}, WHO: {}},
                  },
                },
              },
            },
          },
          {type: 'world_print', inputs: {TEXT: {block: getter('v1')}}},
          {type: CALL, inputs: {VALUE: {}}},
        ],
      },
      variables: [{id: 'v1', name: 'amount', type: 'Number'}],
    }),
    o: file('o', 'other.actor', {
      blocks: {blocks: [{type: 'world_actor', fields: {NAME: 'Other'}}]},
    }),
  },
  openFiles: [],
});

/** A saved block, as far as these tests read one. */
interface Saved {
  type: string;
  next: {block: Saved};
  inputs: Record<string, {block: Saved}>;
  fields: Record<string, unknown>;
}

const world = (source: MultiFileSource) =>
  JSON.parse(source.files.w.contents) as {
    blocks: {blocks: Saved[]};
    variables: Array<{id: string; name: string; type: string}>;
  };

describe('a member’s blocks', () => {
  it('are named after its words', () => {
    expect(memberKey(hurt)).toBe('IsHurtByFromEvent');
    expect(memberTypes('actors/hero', hurt)).toEqual([HAT, EMIT]);
    expect(memberTypes('actors/hero', heal)).toEqual([CALL]);
  });

  it('are used where a file holds one', () => {
    expect(memberUses(project(), 'actors/hero', hurt)).toEqual(['w']);
    expect(memberUses(project(), 'actors/hero', heal)).toEqual(['w']);
  });
});

describe('a member renamed', () => {
  it('is the same project when nothing that names a block changed', () => {
    const source = project();
    expect(renameMember(source, 'actors/hero', hurt, {...hurt})).toBe(source);
  });

  it('takes its uses to its new words', () => {
    const after: ActorMember = {
      ...heal,
      parts: [{kind: 'label', text: 'mend by'}, heal.parts[1]],
    };
    const roots = world(renameMember(project(), 'actors/hero', heal, after))
      .blocks.blocks;
    expect(roots[2].type).toBe('world_do_ActorsHero_MendByAction');
  });

  it('takes a renamed value’s socket and its reading under the hat', () => {
    const after: ActorMember = {
      ...hurt,
      parts: hurt.parts.map(part =>
        part.kind === 'param' && part.name === 'amount'
          ? {...part, name: 'damage'}
          : part,
      ),
    };
    const next = world(renameMember(project(), 'actors/hero', hurt, after));
    const [handler, step] = next.blocks.blocks;
    const print = handler.next.block;
    const emit = print.next.block;

    expect(Object.keys(emit.inputs)).toEqual(['WHO', 'DAMAGE']);
    // Under the hat, the getter reads `damage`, made for it…
    const made = next.variables.find(one => one.name === 'damage')!;
    expect(made).toMatchObject({type: 'Number'});
    expect(print.inputs.TEXT.block.fields.VAR).toEqual({id: made.id});
    // …and outside it, `amount` is still somebody else’s.
    expect(step.inputs.TEXT.block.fields.VAR).toEqual({id: 'v1'});
  });

  it('leaves a value taken away to say so where it was used', () => {
    const after: ActorMember = {...hurt, parts: hurt.parts.slice(0, 3)};
    const next = world(renameMember(project(), 'actors/hero', hurt, after));
    expect(next.blocks.blocks[0].type).toBe(
      'world_on_ActorsHero_IsHurtByFromEvent',
    );
    expect(
      Object.keys(next.blocks.blocks[0].next.block.next.block.inputs),
    ).toEqual(['AMOUNT', 'WHO']);
  });
});
