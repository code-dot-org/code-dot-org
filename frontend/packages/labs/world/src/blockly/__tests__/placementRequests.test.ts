// Which placements want a picture of their own (specs/UI_ACTORS.md).
//
// A kind's picture is not a placement's — three Labels on one map say three
// different things — but most placements ARE their kind, and rendering one per
// actor on a forty-tile map would be forty renders of the same tile. What these
// pin is the line between the two, which is the key.

import {describe, expect, it} from 'vitest';

import {placementKey} from '../mapPlacements';
import {projectPlacements} from '../placementRequests';

/** A `.world` holding one `create actor in map` with these placements. */
const worldWith = (type: string, placements: object[]) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'W'},
          next: {
            block: {
              type: 'world_create_in_map',
              fields: {ACTOR: type, PLACEMENTS: placements},
            },
          },
        },
      ],
    },
  });

const at = (x: number, y: number) => ({positional: {position: {x, y}}});

describe('placementKey', () => {
  it('is nothing when the kind’s own picture is the answer', () => {
    // Most of a map: forty tiles that differ only in where they stand. A
    // thumbnail is drawn with no position at all, and whatever draws the
    // placement applies the scale and rotation itself.
    expect(placementKey('actors/ground')).toBeUndefined();
    expect(placementKey('actors/ground', at(16, 304))).toBeUndefined();
  });

  it('is the same for two placements that override the same things', () => {
    // …so they are rendered once and share the answer, which is the whole
    // reason it is derived from content rather than from the placement's id.
    const one = placementKey('actors/label', {
      ...at(0, 0),
      Shows_Text: {text: 'Score', text_color: '#fff'},
    });
    const two = placementKey('actors/label', {
      ...at(99, 99),
      Shows_Text: {text: 'Score', text_color: '#fff'},
    });

    expect(one).toBeDefined();
    expect(one).toBe(two);
  });

  it('does not depend on the order the overrides were written in', () => {
    // A key that did would miss its own cache after an edit that changed
    // nothing, because `setProperty` rebuilds the object as it goes.
    expect(
      placementKey('actors/label', {Shows_Text: {b: 2, a: 1}, Spin: {s: 1}}),
    ).toBe(
      placementKey('actors/label', {Spin: {s: 1}, Shows_Text: {a: 1, b: 2}}),
    );
  });

  it('tells two kinds apart even when they override the same thing', () => {
    expect(placementKey('actors/label', {Shows_Text: {text: 'x'}})).not.toBe(
      placementKey('actors/button', {Shows_Text: {text: 'x'}}),
    );
  });
});

describe('projectPlacements', () => {
  it('asks for one render per DISTINCT placement', () => {
    const files = {
      'worlds/main.world': worldWith('actors/label', [
        {id: 'a', properties: {...at(0, 0), Shows_Text: {text: 'Score'}}},
        {id: 'b', properties: {...at(0, 32), Shows_Text: {text: 'Lives'}}},
        // The same words somewhere else: one picture, asked for once.
        {id: 'c', properties: {...at(0, 64), Shows_Text: {text: 'Score'}}},
      ]),
    };

    const requests = projectPlacements(files);
    expect(requests).toHaveLength(2);
    expect(requests.map(request => request.type)).toEqual([
      'actors/label',
      'actors/label',
    ]);
  });

  it('asks for nothing when every placement is just its kind', () => {
    expect(
      projectPlacements({
        'worlds/main.world': worldWith('actors/coin', [
          {id: 'a', properties: at(0, 0)},
          {id: 'b', properties: at(32, 0)},
          {id: 'c'},
        ]),
      }),
    ).toEqual([]);
  });

  it('finds a block nested in a layer’s body', () => {
    // `define layer` OWNS its contents, so an interface's placements are two
    // levels down from the world root (specs/VIEWPORT.md).
    const nested = JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'world_world',
            next: {
              block: {
                type: 'world_define_layer',
                fields: {NAME: 'Interface'},
                inputs: {
                  DO: {
                    block: {
                      type: 'world_create_in_map',
                      fields: {
                        ACTOR: 'actors/label',
                        PLACEMENTS: [
                          {id: 'a', properties: {Shows_Text: {text: 'HUD'}}},
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    });

    expect(projectPlacements({'worlds/main.world': nested})).toHaveLength(1);
  });

  it('looks only at worlds, and survives one mid-edit', () => {
    expect(
      projectPlacements({
        'actors/label.actor': worldWith('actors/label', [
          {id: 'a', properties: {Shows_Text: {text: 'x'}}},
        ]),
        'worlds/broken.world': '{not json',
      }),
    ).toEqual([]);
  });
});
