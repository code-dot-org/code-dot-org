// What a new thing is made of, and what a clone changes about a copy.

import {describe, expect, it} from 'vitest';

import {fileStem, renamed, seedFor} from '../newThing';

describe('the file a new thing goes in', () => {
  it('is the name, in the shape every shipped stem has', () => {
    expect(fileStem('Health Bar')).toBe('healthBar');
    expect(fileStem('Coin Spin')).toBe('coinSpin');
    // Punctuation is a word boundary, not something to carry into a path.
    expect(fileStem('Has Gravity (heavy)')).toBe('hasGravityHeavy');
  });

  it('is empty for a name with nothing in it', () => {
    // The caller validates before writing; what matters here is that this
    // answers rather than producing `.actor` with no stem at all.
    expect(fileStem('  ')).toBe('');
  });
});

describe('what a new file starts as', () => {
  it('declares the name it was given, for each kind that can', () => {
    const named = (extension: string): string | undefined => {
      const seed = seedFor(extension, 'Chaser');
      if (!seed || !('contents' in seed)) {
        return undefined;
      }
      const parsed = JSON.parse(seed.contents) as {
        blocks?: {blocks?: Array<{fields?: {NAME?: string}}>};
        name?: string;
      };
      return parsed.blocks?.blocks?.[0]?.fields?.NAME ?? parsed.name;
    };

    for (const extension of ['world', 'actor', 'rule']) {
      expect(named(extension), extension).toBe('Chaser');
    }
    // …and the two documents that name themselves at the top level.
    expect(named('anim')).toBe('Chaser');
    expect(named('effect')).toBe('Chaser');
  });

  it('writes a rule’s three sentences for you', () => {
    // What a rule IS before it does anything: what it is called, what
    // carrying it is called, and when it runs. Left to a learner those were
    // three blocks to find and a phase to pick — enough ceremony that the lab
    // once grew a `.behavior` file type to skip them, which nothing reached
    // for (specs/BEHAVIORS.md). Seeded, a one-name rule costs what a behavior
    // did, with the two sentences it hid on the screen.
    const seed = seedFor('rule', 'Bob') as {contents: string};
    const {blocks} = JSON.parse(seed.contents) as {
      blocks: {
        blocks: Array<{
          type: string;
          fields?: Record<string, string>;
          next?: {block: {type: string; fields?: Record<string, string>}};
        }>;
      };
    };
    const [rule, trait] = blocks.blocks;
    expect(rule.type).toBe('world_rule');
    // The ability as the name — the same fallback `parseRuleMeta` makes for an
    // empty field, and not the block's own "Has My Rule".
    expect(rule.fields).toEqual({NAME: 'Bob', ABILITY: 'Bob'});
    expect(trait.type).toBe('world_rule_trait');
    expect(trait.fields).toEqual({NAME: 'Bob', SUBJECT: 'actor'});
    expect(trait.next?.block.type).toBe('world_trait_step');
    expect(trait.next?.block.fields).toEqual({PHASE: 'decide'});
    expect(blocks.blocks).toHaveLength(2);
  });

  it('is bytes for a sprite, and a picture that can be drawn on', () => {
    const seed = seedFor('png', 'Chaser');

    expect(seed).toMatchObject({mimeType: 'image/png'});
    expect((seed as {url: string}).url).toMatch(/^data:image\/png;base64,/);
  });

  it('is the empty document for a kind that carries no name', () => {
    // A map is an arrangement rather than a thing with a name — but a file
    // created with no contents gets Codebridge's "Add your changes to …"
    // placeholder, and that sentence inside a `.map` is a document nothing can
    // parse.
    const seed = seedFor('map', 'Level 2') as {contents: string};

    expect(JSON.parse(seed.contents)).toMatchObject({type: 'map', actors: []});
  });

  it('is nothing for a kind with no way to start one', () => {
    // A sound is bytes and there is no editor to fill an empty one in.
    expect(seedFor('mp3', 'Jump')).toBeUndefined();
  });
});

describe('renaming a copy', () => {
  it('rewrites a Blockly root’s name', () => {
    const file = JSON.stringify({
      blocks: {blocks: [{type: 'world_rule', fields: {NAME: 'Has Gravity'}}]},
    });

    expect(
      JSON.parse(renamed(file, 'Heavier')).blocks.blocks[0].fields.NAME,
    ).toBe('Heavier');
  });

  it('rewrites a document’s own name', () => {
    const file = JSON.stringify({type: 'animation', name: 'Coin Spin'});

    expect(JSON.parse(renamed(file, 'Coin Flip')).name).toBe('Coin Flip');
  });

  it('leaves alone what it does not recognise', () => {
    // A map names nothing; a clone of one is a copy with a new FILE name, and
    // rewriting its contents would be inventing a field.
    const file = JSON.stringify({type: 'map', actors: []});

    expect(renamed(file, 'Level 2')).toBe(file);
    expect(renamed('not json at all', 'Level 2')).toBe('not json at all');
  });
});
