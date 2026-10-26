// What World Lab tells the tutor.
//
// The design decision under test is the SPLIT, and it comes from measurement:
// the starter project's rules serialize to ~950,000 characters (`solid.rule`
// alone is 390,714) while its actors and world come to ~24,000 between them.
// So actors and worlds go as they are, and rules go as metadata.

import {describe, expect, it} from 'vitest';

import type {RuleMeta} from '../../blockly/ruleMeta';
import {MAX_FILE_CHARS, worldContext, worldSourceCode} from '../context';

const rule = (over: Partial<RuleMeta> = {}): RuleMeta =>
  ({
    id: 'Gravity',
    name: 'Gravity',
    ability: 'Falls',
    source: 'builtin',
    ref: {} as RuleMeta['ref'],
    requires: [],
    traits: [{id: 'Falls', name: 'Falls', ref: {}, requires: []}],
    properties: [
      {
        id: 'gravity',
        name: 'gravity',
        type: 'number',
        default: 1,
        readonly: false,
        scope: 'trait',
        ref: {},
      },
    ],
    actions: [],
    queries: [],
    events: [
      {id: 'startsFalling', name: 'starts falling', params: [], ref: {}},
    ],
    steps: [],
    enums: [],
    ...over,
  }) as unknown as RuleMeta;

const source = (files: Record<string, string>, rules: RuleMeta[] = []) =>
  worldSourceCode({files, rules})!;

describe('rules go as metadata', () => {
  it('names what a rule offers, not how it is built', () => {
    // `solid.rule` is 390,714 characters of machine-generated blocks. What a
    // student needs is that electing "Falls" makes a thing fall.
    const out = source({}, [rule()]);

    expect(out).toContain('Gravity — Falls');
    expect(out).toContain('traits an actor can elect: Falls');
    expect(out).toContain('gravity (number)');
    expect(out).toContain('starts falling');
  });

  it('says outright that implementations are not shown', () => {
    // Otherwise the model asks for them, or invents them.
    expect(source({}, [rule()])).toContain('implementations are not shown');
  });

  it('never sends a rule file itself, however small', () => {
    const out = source({'rules/gravity.rule': '{"blocks":{"blocks":[]}}'}, [
      rule(),
    ]);

    expect(out).not.toContain('"blocks"');
  });
});

describe('actors and worlds go as they are', () => {
  it('sends the workspace, unmodified', () => {
    // It is the form the agent has to write BACK, so sending anything else
    // would be asking it to author a shape it has never seen.
    const workspace = '{"blocks":{"languageVersion":0,"blocks":[]}}';
    const out = source({'actors/coin.actor': workspace});

    expect(out).toContain('actors/coin.actor');
    expect(out).toContain(workspace);
  });

  it('says that this is the form to write back', () => {
    expect(source({'actors/coin.actor': '{}'})).toContain(
      'the form to write back',
    );
  });

  it('names a workspace too big to send rather than dropping it silently', () => {
    // A silent omission reads to the model as a file that does not exist.
    const out = source({
      'actors/huge.actor': '{'.repeat(MAX_FILE_CHARS + 1),
      'actors/small.actor': '{}',
    });

    expect(out).toContain('Not shown, too large to send: actors/huge.actor');
    expect(out).toContain('actors/small.actor');
  });
});

describe('the block catalogue', () => {
  it('is always sent, because the agent cannot invent block types', () => {
    const out = source({});

    expect(out).toContain('Every block available in this project');
    expect(out).toContain('world_use_trait');
  });

  it('explains how to read a block sentence', () => {
    expect(source({})).toContain('marking its sockets in order');
  });
});

describe('worldContext', () => {
  it('carries the console, where a running game says what went wrong', () => {
    expect(
      worldContext({
        files: {},
        rules: [],
        consoleOutput: 'Player started falling',
        longInstructions: 'Make the player jump.',
        hasRun: true,
      }),
    ).toMatchObject({
      consoleOutput: 'Player started falling',
      longInstructions: 'Make the player jump.',
      hasRun: true,
    });
  });
});
