// What the member page changes (specs/ACTOR_BLOCKS_PLAN.md, step 3).

import {describe, expect, it} from 'vitest';

import type {ActorData, ActorMember, ActorMemberPart} from '../../actorData';
import {
  addMember,
  designProblems,
  linesOf,
  memberDocument,
  newMember,
  newPart,
  removeMember,
  setMember,
  withMemberDocument,
  withValueNames,
} from '../memberEdits';

const word = (text: string): ActorMemberPart => ({kind: 'label', text});
const row: ActorMemberPart = {kind: 'row'};
const value = (name: string, id = ''): ActorMemberPart => ({
  kind: 'param',
  type: 'number',
  var: id,
  name,
});

const hero = (members: ActorMember[] = []): ActorData => ({
  type: 'actor',
  name: 'Hero',
  ...(members.length ? {members} : {}),
  blocks: {
    blocks: {languageVersion: 0, blocks: [{type: 'world_on_x', id: 'hat'}]},
    variables: [{id: 'v1', name: 'amount', type: 'Number'}],
  },
});

describe('a new member', () => {
  it('reads as something, with an id no other member has', () => {
    const one = newMember(hero(), 'block');
    const data = addMember(hero(), one);
    const two = newMember(data, 'block');

    expect(one.parts).toEqual([word('do something')]);
    expect(newMember(hero(), 'event').parts).toEqual([word('happens')]);
    expect(two.id).not.toBe(one.id);
  });

  it('goes, and takes the list with it when it was the last', () => {
    const one = newMember(hero(), 'event');
    expect(
      removeMember(addMember(hero(), one), one.id).members,
    ).toBeUndefined();
  });
});

describe('a member written', () => {
  it('leaves out a break that ends nothing', () => {
    const one = newMember(hero(), 'block');
    const data = setMember(addMember(hero(), one), {
      ...one,
      parts: [row, word('heal'), row, row, value('amount'), row],
    });

    expect(data.members![0].parts).toEqual([
      word('heal'),
      row,
      value('amount'),
    ]);
  });
});

describe('a new part', () => {
  it('is a value named after its type, apart from the others', () => {
    expect(newPart('number', [value('amount')])).toEqual(value('amount2'));
    expect(newPart('boolean', [])).toMatchObject({
      type: 'boolean',
      name: 'flag',
    });
  });
});

describe('the lines of a design', () => {
  it('start again after each break', () => {
    expect(linesOf([word('a'), row, word('b'), row, word('c')])).toEqual([
      1, 1, 2, 2, 3,
    ]);
  });
});

describe('what is wrong with a design', () => {
  const one = {id: 'block-1', kind: 'block' as const, parts: []};

  it('needs a word', () => {
    expect(designProblems([value('amount')], one, []).design).toMatch(
      /needs a word/,
    );
  });

  it('may not name two values alike, and says which', () => {
    const problems = designProblems(
      [word('heal'), value('amount'), value('Amount')],
      one,
      [],
    );
    expect(problems.values.get(2)).toBe(
      'Two values are called Amount; rename one.',
    );
    expect(problems.values.has(1)).toBe(false);
  });

  it('may not read as another of the same kind', () => {
    const other = {
      id: 'block-2',
      kind: 'block' as const,
      parts: [word('heal')],
    };
    expect(designProblems([word('heal')], one, [other]).design).toMatch(
      /already reads “heal”/,
    );
    expect(
      designProblems([word('heal')], one, [{...other, kind: 'event'}]).design,
    ).toBeUndefined();
  });
});

describe('an event value renamed', () => {
  it('renames the variable it was declared with', () => {
    const data = hero([
      {
        id: 'event-1',
        kind: 'event',
        parts: [word('hurt by'), value('damage', 'v1')],
      },
    ]);
    expect(withValueNames(data).blocks?.variables).toEqual([
      {id: 'v1', name: 'damage', type: 'Number'},
    ]);
    expect(withValueNames(withValueNames(data))).toEqual(withValueNames(data));
  });
});

describe('a block’s implementation, on its own workspace', () => {
  const block: ActorMember = {
    id: 'block-1',
    kind: 'block',
    parts: [word('heal by'), value('amount', 'v1')],
    description: 'Gets better.',
    body: {type: 'world_print'},
  };

  it('is the block at its head, what it does below, and the variables', () => {
    const document = JSON.parse(memberDocument(hero([block]), block));
    expect(document.blocks.blocks).toEqual([
      expect.objectContaining({
        type: 'world_member_head',
        id: 'member-head',
        extraState: {parts: block.parts},
        next: {block: {type: 'world_print'}},
      }),
    ]);
    expect(document.variables).toEqual(hero().blocks!.variables);
  });

  it('comes back as the member’s body and parts, the page’s words kept', () => {
    const data = hero([block]);
    const saved = JSON.parse(memberDocument(data, block));
    const head = saved.blocks.blocks[0];
    head.next = {block: {type: 'world_say'}};
    // The getters the page plugs in are not the member's.
    head.inputs = {VALUE0: {block: {type: 'variables_get_Number'}}};
    head.extraState.parts = [...block.parts, {kind: 'row'}, word('now')];
    saved.variables.push({id: 'v2', name: 'more', type: 'Number'});

    const next = withMemberDocument(data, 'block-1', JSON.stringify(saved));

    expect(next.members![0]).toEqual({
      ...block,
      parts: [...block.parts, {kind: 'row'}, word('now')],
      body: {type: 'world_say'},
    });
    // The actor's own code is left as it was.
    expect(next.blocks?.blocks).toEqual(data.blocks?.blocks);
    expect(next.blocks?.variables).toHaveLength(2);
  });

  it('loses what it does when nothing hangs below the head', () => {
    const data = hero([block]);
    const saved = JSON.parse(memberDocument(data, block));
    delete saved.blocks.blocks[0].next;

    const next = withMemberDocument(data, 'block-1', JSON.stringify(saved));

    expect(next.members![0].body).toBeUndefined();
  });
});
