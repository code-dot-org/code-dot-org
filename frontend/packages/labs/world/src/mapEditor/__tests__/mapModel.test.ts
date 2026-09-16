// How big a map is, and what it reads as when it does not say.
//
// A map used to be exactly the viewport — ten tiles each way, because that was
// the only size anything had. It carries its own now, which makes two things
// worth pinning: an old `.map` still opens at the size it was written for, and
// a number that came out of a text field cannot make a grid the canvas will
// hang on.

import {describe, expect, it} from 'vitest';

import {TILE_SIZE, VIEWPORT_TILES} from '../../runtime/viewport';
import {
  clampTiles,
  extentOf,
  MAX_MAP_TILES,
  MIN_MAP_TILES,
  parseMap,
  chosenActors,
  linksFrom,
  withPicked,
  placementChoices,
  composeTransforms,
  isCarriedBy,
  parentIdOf,
  toLocalPosition,
  withParent,
  worldTransformOf,
  type MapDoc,
  type Placement,
  type Transform,
} from '../mapModel';

const doc = (map: Partial<MapDoc>): string =>
  JSON.stringify({type: 'map', ...map});

describe('parseMap', () => {
  it('reads the size a map states', () => {
    const map = parseMap(doc({size: {width: 20, height: 12}, actors: []}));

    expect(map.size).toEqual({width: 20, height: 12});
  });

  it('gives a map that says nothing the size every map used to be', () => {
    // The compatibility case, and the one that matters most: every `.map`
    // written before this field existed has to open unchanged.
    const map = parseMap(doc({actors: []}));

    expect(map.size).toEqual({
      width: VIEWPORT_TILES,
      height: VIEWPORT_TILES,
    });
  });

  it('gives an empty or unparseable document that size too', () => {
    expect(parseMap('').size.width).toBe(VIEWPORT_TILES);
    expect(parseMap('{oh no').size.height).toBe(VIEWPORT_TILES);
  });

  it('does not take a size the canvas could not draw', () => {
    // A hand-edited file, or a pasted number. `NaN` tiles is a grid loop that
    // never terminates, and 100000 is one that takes the tab with it.
    expect(parseMap(doc({size: {width: 0, height: -4}})).size).toEqual({
      width: MIN_MAP_TILES,
      height: MIN_MAP_TILES,
    });
    expect(parseMap(doc({size: {width: 1e6, height: 1e6}})).size).toEqual({
      width: MAX_MAP_TILES,
      height: MAX_MAP_TILES,
    });
    expect(
      parseMap('{"type":"map","size":{"width":"wide","height":8}}').size,
    ).toEqual({width: VIEWPORT_TILES, height: 8});
  });

  it('keeps the size through a round trip', () => {
    // What the editor does on every commit: stringify, and parse back when the
    // file is reopened.
    const map = parseMap(doc({size: {width: 3, height: 25}, actors: []}));

    expect(parseMap(JSON.stringify(map)).size).toEqual({width: 3, height: 25});
  });
});

describe('clampTiles', () => {
  it('is undefined for what is not a number yet', () => {
    // An emptied field mid-edit. Distinct from a bad number, because the caller
    // leaves the map alone rather than resizing it to 1.
    expect(clampTiles('')).toBeUndefined();
    expect(clampTiles('   ')).toBeUndefined();
    expect(clampTiles('abc')).toBeUndefined();
  });

  it('is a whole number in range', () => {
    expect(clampTiles('12')).toBe(12);
    expect(clampTiles(7.9)).toBe(7);
    expect(clampTiles(0)).toBe(MIN_MAP_TILES);
    expect(clampTiles(MAX_MAP_TILES + 1)).toBe(MAX_MAP_TILES);
  });
});

describe('extentOf', () => {
  it('is the tile count times the tile size, in world pixels', () => {
    // What the camera fits and the canvas draws the border at.
    const map = parseMap(doc({size: {width: 20, height: 12}}));

    expect(extentOf(map)).toEqual({
      w: 20 * TILE_SIZE,
      h: 12 * TILE_SIZE,
    });
  });

  it('is the viewport for a map that never said otherwise', () => {
    expect(extentOf(parseMap(''))).toEqual({
      w: VIEWPORT_TILES * TILE_SIZE,
      h: VIEWPORT_TILES * TILE_SIZE,
    });
  });
});

describe('placementChoices', () => {
  // What an actor-typed property may be pointed at. A map is JSON and JSON
  // holds no actors, so a placement stores another placement's ID and
  // `WorldBuilder.loadMap` resolves it once every entry exists.

  const at = (id?: string) => ({type: 'actors/coin', id}) as Placement;

  it('offers the other placements', () => {
    expect(
      placementChoices([at('Meter'), at('Hero'), at('Coin1')], 'Meter'),
    ).toEqual([
      {value: 'Hero', text: 'Hero'},
      {value: 'Coin1', text: 'Coin1'},
    ]);
  });

  it('never offers the placement itself', () => {
    // A health bar showing its own health, a rider attached to where it
    // already is: things a learner could pick and nothing comes of.
    expect(placementChoices([at('Meter')], 'Meter')).toEqual([]);
  });

  it('leaves out an anonymous placement, which has no name to store', () => {
    expect(placementChoices([at(), at('Hero')], 'Meter')).toEqual([
      {value: 'Hero', text: 'Hero'},
    ]);
  });

  it('offers everything when nothing is selected', () => {
    expect(placementChoices([at('Hero')], undefined)).toEqual([
      {value: 'Hero', text: 'Hero'},
    ]);
  });
});

describe('picking an actor for a reference', () => {
  // The one decision in a pick, and the only place the difference between the
  // two shapes lives: a set is added to, a single reference is replaced.

  it('replaces the one a single reference names', () => {
    expect(withPicked('Old', 'New', false)).toBe('New');
  });

  it('adds to a set rather than replacing it', () => {
    // The whole reason a set needs its own answer: picking twice on a single
    // reference means changing your mind, and on a set it means two goals.
    expect(withPicked(['One'], 'Two', true)).toEqual(['One', 'Two']);
  });

  it('starts a set from nothing', () => {
    expect(withPicked(undefined, 'One', true)).toEqual(['One']);
  });

  it('does not add the same actor twice', () => {
    // A set holds a thing or it does not. Twice over would draw two outlines
    // on one actor and offer two Removes that do different things.
    expect(withPicked(['One', 'Two'], 'One', true)).toEqual(['One', 'Two']);
  });
});

describe('chosenActors', () => {
  it('reads the list a set names', () => {
    const walker = {
      type: 'actors/walker',
      id: 'W',
      properties: {path: {goingTo: ['One']}},
    } as unknown as Placement;

    expect(chosenActors(walker, 'path', 'goingTo')).toEqual(['One']);
  });

  it('is empty for a property nothing has set', () => {
    const walker = {type: 'actors/walker', id: 'W'} as Placement;

    expect(chosenActors(walker, 'path', 'goingTo')).toEqual([]);
  });
});

describe('linksFrom', () => {
  // What the canvas draws a line for. A reference is otherwise invisible — the
  // value is a name in a panel and the actor it names may be scrolled off the
  // canvas — so this is the rule behind the line, kept out of the drawing so
  // it can be checked.

  const schema = [
    {
      props: [
        {ownerId: 'bar', propId: 'subject', name: 'subject', type: 'actor'},
        {ownerId: 'bar', propId: 'label', name: 'label', type: 'string'},
      ],
    },
  ];
  const meter = {
    type: 'actors/bar',
    id: 'Meter',
    properties: {bar: {subject: 'Hero', label: 'Hero'}},
  } as Placement;
  const hero = {type: 'actors/player', id: 'Hero'} as Placement;

  it('finds the actor a reference names, and what it is called', () => {
    expect(linksFrom(meter, schema, [meter, hero])).toEqual([
      {name: 'subject', targetId: 'Hero'},
    ]);
  });

  it('draws a line to every actor a SET names, in order', () => {
    // Drawing all of them is what makes such a property readable at all:
    // "going to" holding three names says nothing in a panel until the three
    // are outlined on the canvas.
    const walkerSchema = [
      {
        props: [
          {
            ownerId: 'path',
            propId: 'goingTo',
            name: 'going to',
            type: 'actors',
          },
        ],
      },
    ];
    const walker = {
      type: 'actors/walker',
      id: 'Walker',
      properties: {path: {goingTo: ['Two', 'One']}},
    } as unknown as Placement;
    const one = {type: 'actors/flag', id: 'One'} as Placement;
    const two = {type: 'actors/flag', id: 'Two'} as Placement;

    expect(linksFrom(walker, walkerSchema, [walker, one, two])).toEqual([
      {name: 'going to', targetId: 'Two'},
      {name: 'going to', targetId: 'One'},
    ]);
  });

  it('leaves out a name in a set with nothing on the canvas to point at', () => {
    const walkerSchema = [
      {
        props: [
          {
            ownerId: 'path',
            propId: 'goingTo',
            name: 'going to',
            type: 'actors',
          },
        ],
      },
    ];
    const walker = {
      type: 'actors/walker',
      id: 'Walker',
      properties: {path: {goingTo: ['Gone', 'One']}},
    } as unknown as Placement;
    const one = {type: 'actors/flag', id: 'One'} as Placement;

    expect(linksFrom(walker, walkerSchema, [walker, one])).toEqual([
      {name: 'going to', targetId: 'One'},
    ]);
  });

  it('ignores a string property that merely holds the same word', () => {
    // The SCHEMA is what says a property is a reference, because the map
    // cannot: the value is a string either way, and `"Hero"` is a name to
    // resolve or a word to display depending on a type the map does not
    // record. `label` holds "Hero" here too, and draws no line.
    const links = linksFrom(meter, schema, [meter, hero]);

    expect(links).toHaveLength(1);
  });

  it('draws nothing for a reference to a placement that is gone', () => {
    // The map keeps the value — a placement may name one since deleted, and
    // `loadMap` leaves such a property unset rather than failing — but there
    // is nothing on the canvas to point at.
    expect(linksFrom(meter, schema, [meter])).toEqual([]);
  });

  it('draws nothing for a reference that was never set', () => {
    const blank = {type: 'actors/bar', id: 'Meter'} as Placement;

    expect(linksFrom(blank, schema, [blank, hero])).toEqual([]);
  });

  it('finds every reference an actor holds, not just the first', () => {
    // A Health Bar over a player is `subject` AND `attached to`, and two
    // identical lines would say there were two of something without saying
    // which — which is what the labels are for.
    const both = [
      {
        props: [
          {ownerId: 'bar', propId: 'subject', name: 'subject', type: 'actor'},
          {
            ownerId: 'att',
            propId: 'attached_to',
            name: 'attached to',
            type: 'actor',
          },
        ],
      },
    ];
    const rider = {
      type: 'actors/bar',
      id: 'Meter',
      properties: {bar: {subject: 'Hero'}, att: {attached_to: 'Hero'}},
    } as Placement;

    expect(linksFrom(rider, both, [rider, hero]).map(l => l.name)).toEqual([
      'subject',
      'attached to',
    ]);
  });
});

describe('a placement carried by another (parenting)', () => {
  const at = (
    id: string,
    x: number,
    y: number,
    more: Record<string, unknown> = {},
  ): Placement => ({
    type: 'actors/thing',
    id,
    properties: {positional: {position: {x, y}, ...more}},
  });
  const round = (t: Transform) => ({
    x: Math.round(t.pos.x),
    y: Math.round(t.pos.y),
    rotation: Math.round(t.rotation),
    scale: {
      x: Math.round(t.scale.x * 100) / 100,
      y: Math.round(t.scale.y * 100) / 100,
    },
  });

  it('reads the parent id, and nothing for an empty one', () => {
    expect(parentIdOf(at('a', 0, 0, {parent: 'Dialog'}))).toBe('Dialog');
    expect(parentIdOf(at('a', 0, 0, {parent: ''}))).toBeUndefined();
    expect(parentIdOf(at('a', 0, 0))).toBeUndefined();
  });

  it('is drawn at its parent plus its stored, local place', () => {
    const dialog = at('Dialog', 100, 100);
    const ok = at('OK', 60, 30, {parent: 'Dialog'});
    const actors = [dialog, ok];
    expect(round(worldTransformOf(ok, actors))).toMatchObject({x: 160, y: 130});
    // Move the parent: the child's stored values did not change, its place did.
    const moved = [at('Dialog', 200, 100), ok];
    expect(round(worldTransformOf(ok, moved))).toMatchObject({x: 260, y: 130});
  });

  it('turns and grows with a turned, scaled parent', () => {
    const tank = at('Tank', 100, 100, {rotation: 90, scale: {x: 2, y: 2}});
    const turret = at('Turret', 0, -24, {parent: 'Tank'});
    const world = worldTransformOf(turret, [tank, turret]);
    expect(round(world)).toEqual({
      x: 148,
      y: 100,
      rotation: 90,
      scale: {x: 2, y: 2},
    });
  });

  it('composes through a chain, and stops at a parent the map lacks', () => {
    const a = at('a', 10, 10);
    const b = at('b', 5, 0, {parent: 'a'});
    const c = at('c', 0, 5, {parent: 'b'});
    expect(round(worldTransformOf(c, [a, b, c]))).toMatchObject({x: 15, y: 15});
    const orphan = at('o', 7, 7, {parent: 'gone'});
    expect(round(worldTransformOf(orphan, [orphan]))).toMatchObject({
      x: 7,
      y: 7,
    });
  });

  it('ends a cycle where it is rather than nowhere', () => {
    const a = at('a', 1, 1, {parent: 'b'});
    const b = at('b', 2, 2, {parent: 'a'});
    expect(() => worldTransformOf(a, [a, b])).not.toThrow();
    expect(isCarriedBy(a, b, [a, b])).toBe(true);
  });

  it('undoes its own composition', () => {
    const parent: Transform = {
      pos: {x: 100, y: 100},
      scale: {x: 2, y: 0.5},
      rotation: 30,
      skew: 0,
    };
    const local: Transform = {
      pos: {x: 12, y: -7},
      scale: {x: 1, y: 1},
      rotation: 0,
      skew: 0,
    };
    const back = toLocalPosition(composeTransforms(parent, local).pos, parent);
    expect(back.x).toBeCloseTo(12);
    expect(back.y).toBeCloseTo(-7);
  });

  it('keeps a placement where it is when it is given a parent', () => {
    const dialog = at('Dialog', 100, 100, {rotation: 90});
    const ok = at('OK', 160, 130);
    const carried = withParent(ok, 'Dialog', [dialog, ok]);
    expect(parentIdOf(carried)).toBe('Dialog');
    const world = worldTransformOf(carried, [dialog, carried]);
    expect(round(world)).toMatchObject({x: 160, y: 130, rotation: 0});
    // …and where it is when the parent is taken away again.
    const freed = withParent(carried, undefined, [dialog, carried]);
    expect(parentIdOf(freed)).toBeUndefined();
    expect(round(worldTransformOf(freed, [dialog, freed]))).toMatchObject({
      x: 160,
      y: 130,
    });
  });

  it('writes no rotation or scale for a child of a plain parent', () => {
    const dialog = at('Dialog', 100, 100);
    const ok = withParent(at('OK', 160, 130), 'Dialog', [dialog]);
    expect(ok.properties?.positional).toEqual({
      position: {x: 60, y: 30},
      parent: 'Dialog',
    });
  });

  it('refuses a cycle and changes nothing', () => {
    const a = at('a', 0, 0);
    const b = at('b', 0, 0, {parent: 'a'});
    expect(withParent(a, 'b', [a, b])).toBe(a);
    expect(withParent(a, 'a', [a, b])).toBe(a);
  });
});
