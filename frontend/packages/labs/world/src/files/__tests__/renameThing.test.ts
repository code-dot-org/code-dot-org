// Renaming a thing, and what has to move with it.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';

import {renameThing} from '../renameThing';

const file = (over: Partial<ProjectFile> & {id: string}): ProjectFile => ({
  name: 'x',
  language: 'actor',
  contents: '',
  folderId: 'actors',
  ...over,
});

/** `player.actor`, a world that places it, and a map that puts one down. */
const project = (): MultiFileSource => ({
  folders: {
    actors: {id: 'actors', name: 'actors', parentId: '0', open: true},
    worlds: {id: 'worlds', name: 'worlds', parentId: '0', open: true},
    maps: {id: 'maps', name: 'maps', parentId: '0', open: true},
  },
  files: {
    a: file({
      id: 'a',
      name: 'player.actor',
      contents: JSON.stringify({
        blocks: {blocks: [{type: 'world_actor', fields: {NAME: 'Player'}}]},
      }),
    }),
    w: file({
      id: 'w',
      name: 'main.world',
      language: 'world',
      folderId: 'worlds',
      contents: JSON.stringify({
        blocks: {
          blocks: [
            {
              type: 'world_world',
              fields: {NAME: 'My World'},
              next: {
                block: {
                  type: 'world_add_actor',
                  fields: {ACTOR: 'actors/player'},
                  next: {
                    block: {
                      // Prose that happens to say the same words.
                      type: 'world_log',
                      fields: {TEXT: 'actors/player'},
                    },
                  },
                },
              },
            },
            {
              // A property the actor declares, whose block type is minted from
              // the actor's PATH.
              type: 'world_get_ActorsPlayer_IdProperty',
              fields: {},
            },
          ],
        },
      }),
    }),
    m: file({
      id: 'm',
      name: 'level1.map',
      language: 'map',
      folderId: 'maps',
      contents: JSON.stringify({
        type: 'map',
        actors: [{type: 'actors/player', id: 'Player'}],
      }),
    }),
  },
  openFiles: [],
});

const read = (source: MultiFileSource, id: string) => source.files[id].contents;

describe('renaming an actor', () => {
  it('renames the thing, and moves its file to match', () => {
    const source = project();

    const {source: next, refusal} = renameThing(source, source.files.a, 'Hero');

    expect(refusal).toBeUndefined();
    expect(next.files.a.name).toBe('hero.actor');
    expect(JSON.parse(read(next, 'a')).blocks.blocks[0].fields.NAME).toBe(
      'Hero',
    );
  });

  it('carries every reference to where the file went', () => {
    const source = project();

    const {source: next} = renameThing(source, source.files.a, 'Hero');
    const world = JSON.parse(read(next, 'w'));

    // The placement, by module path.
    expect(world.blocks.blocks[0].next.block.fields.ACTOR).toBe('actors/hero');
    // …and the map, which is a document rather than a workspace.
    expect(JSON.parse(read(next, 'm')).actors[0].type).toBe('actors/hero');
  });

  it('carries the block types minted from its path', () => {
    // An actor's own properties and blocks are keyed by `pathSlug` of the
    // file's path, so a moved file leaves every saved `get id of` block naming
    // a type nothing mints — which is a stand-in block that generates nothing.
    const source = project();

    const {source: next} = renameThing(source, source.files.a, 'Hero');

    expect(JSON.parse(read(next, 'w')).blocks.blocks[1].type).toBe(
      'world_get_ActorsHero_IdProperty',
    );
  });

  it('leaves prose alone', () => {
    // The walk reads FIELDS, and a `log` block's field is a sentence about the
    // project rather than a reference to it.
    const source = project();

    const {source: next} = renameThing(source, source.files.a, 'Hero');
    const said = JSON.parse(read(next, 'w')).blocks.blocks[0].next.block.next
      .block.fields.TEXT;

    expect(said).toBe('actors/player');
  });

  it('refuses a name whose file is already taken', () => {
    const source = project();
    source.files.b = file({id: 'b', name: 'hero.actor'});

    const {source: next, refusal} = renameThing(source, source.files.a, 'Hero');

    expect(refusal).toMatch(/already a file called hero.actor/);
    expect(next).toBe(source); // nothing half-done
  });
});

describe('renaming the world the lab runs', () => {
  it('renames the world and leaves its file where the runtime looks', () => {
    // `worlds/main.world` is the entry BY PATH: without it the runtime says
    // "No entry file" and the project does not run at all.
    const source = project();

    const {source: next} = renameThing(source, source.files.w, 'The Hall');

    expect(next.files.w.name).toBe('main.world');
    expect(JSON.parse(read(next, 'w')).blocks.blocks[0].fields.NAME).toBe(
      'The Hall',
    );
  });
});

describe('renaming a rule', () => {
  /** A rule, an actor that takes its trait, and a world that uses it. */
  const rules = (): MultiFileSource => ({
    folders: {
      rules: {id: 'rules', name: 'rules', parentId: '0', open: true},
      actors: {id: 'actors', name: 'actors', parentId: '0', open: true},
    },
    files: {
      r: file({
        id: 'r',
        name: 'gravity.rule',
        language: 'rule',
        folderId: 'rules',
        contents: JSON.stringify({
          blocks: {blocks: [{type: 'world_rule', fields: {NAME: 'Gravity'}}]},
        }),
      }),
      a: file({
        id: 'a',
        name: 'player.actor',
        contents: JSON.stringify({
          blocks: {
            blocks: [
              {
                type: 'world_actor',
                fields: {NAME: 'Player'},
                next: {
                  block: {
                    type: 'world_use_trait',
                    fields: {TRAIT: 'Gravity#AffectedByGravityTrait'},
                    next: {
                      block: {
                        type: 'world_get_Gravity_StrengthProperty',
                        fields: {},
                      },
                    },
                  },
                },
              },
            ],
          },
        }),
      }),
    },
    openFiles: [],
  });

  it('carries the name every trait and member is keyed by', () => {
    // A rule's NAME is a reference in itself: an actor takes
    // `Gravity#AffectedByGravityTrait`, and the block type of every member it
    // declares is minted from the same word.
    const source = rules();

    const {source: next} = renameThing(source, source.files.r, 'Heavy Air');
    const actor = JSON.parse(next.files.a.contents).blocks.blocks[0].next.block;

    // The trait carries the rule's name AS WRITTEN — `Solid Bodies#SolidTrait`
    // is how every shipped file says one — while the block type carries the
    // slug, which is the same name with the spaces taken out.
    expect(actor.fields.TRAIT).toBe('Heavy Air#AffectedByGravityTrait');
    expect(actor.next.block.type).toBe('world_get_HeavyAir_StrengthProperty');
    // …and the rule says its own new name, in the file that moved with it.
    expect(next.files.r.name).toBe('heavyAir.rule');
    expect(JSON.parse(next.files.r.contents).blocks.blocks[0].fields.NAME).toBe(
      'Heavy Air',
    );
  });
});
