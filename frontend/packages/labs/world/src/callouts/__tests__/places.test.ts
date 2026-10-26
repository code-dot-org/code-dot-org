// Named places: what a lesson's "Show me" link can name
// (specs/SHOW_ME_PLAN.md).

import {describe, expect, it} from 'vitest';

import {
  clickableNames,
  parsePlaceName,
  PLACE_NAMES,
  placeNamed,
} from '../places';

describe('a place’s name', () => {
  it('splits at its first colon, and only there', () => {
    expect(parsePlaceName('view.world')).toEqual({
      place: 'view.world',
      argument: undefined,
    });
    expect(parsePlaceName('map.enhance:Hero')).toEqual({
      place: 'map.enhance',
      argument: 'Hero',
    });
    // A block type has no colon, but a drawer's name might.
    expect(parsePlaceName('toolbox.drawer:When: then').argument).toBe(
      'When: then',
    );
    expect(parsePlaceName('map.enhance:').argument).toBeUndefined();
  });

  it('means nothing when the lab has no such place', () => {
    expect(placeNamed('map.teleporter')).toBeUndefined();
    expect(placeNamed('')).toBeUndefined();
  });
});

describe('every place', () => {
  it.each(PLACE_NAMES)('%s says where it is, in a sentence', name => {
    const place = placeNamed(name)!;
    expect(place.says).toMatch(/^[A-Z].*\.$/);
    // Words that stand without the picture: nothing that needs a finger.
    // "Above the editor" is fine, since it names what it is above.
    expect(place.says).not.toMatch(/\b(here|this|that one)\b/i);
  });

  it('asks for the map before anything that is on it', () => {
    for (const name of PLACE_NAMES.filter(each => each.startsWith('map.'))) {
      expect(placeNamed(name)!.reveals[0], name).toEqual({
        kind: 'view',
        view: 'map',
      });
    }
  });

  it('carries its argument into what it asks for and what it says', () => {
    const enhance = placeNamed('map.enhance:Ground')!;
    expect(enhance.reveals).toContainEqual({
      kind: 'placement',
      named: 'Ground',
    });
    expect(enhance.says).toContain('Ground');
    expect(placeNamed('toolbox.block:world_print')!.reveals).toEqual([
      {kind: 'toolbox', block: 'world_print'},
    ]);
    // A palette tile is marked per kind, since there are several.
    expect(placeNamed('map.palette:Hero')!.mark).toBe('map.palette:Hero');
  });

  it('has no mark when it is a block, which Blockly rings itself', () => {
    expect(placeNamed('toolbox.block:world_print')!.mark).toBeUndefined();
  });
});

describe('a place in another file', () => {
  it('asks for the file first, by the actor a lesson names', () => {
    expect(placeNamed('actor.blocks:Hero')!.reveals).toEqual([
      {kind: 'file', actor: 'Hero'},
    ]);
    expect(placeNamed('world.blocks')!.reveals).toEqual([
      {kind: 'file', world: true},
      {kind: 'view', view: 'world'},
    ]);
  });

  it('reads `@` on a block or a drawer as which file’s toolbox', () => {
    expect(placeNamed('toolbox.block:world_print@Hero')!.reveals).toEqual([
      {kind: 'file', actor: 'Hero'},
      {kind: 'toolbox', block: 'world_print'},
    ]);
    // The world's blocks are a VIEW of the world's file, so both.
    expect(placeNamed('toolbox.drawer:Loops@world')!.reveals).toEqual([
      {kind: 'file', world: true},
      {kind: 'view', view: 'world'},
      {kind: 'toolbox', drawer: 'Loops'},
    ]);
  });

  it('asks for no file when none is said: whichever is in front', () => {
    expect(placeNamed('toolbox.block:world_print')!.reveals).toEqual([
      {kind: 'toolbox', block: 'world_print'},
    ]);
  });
});

describe('the names in a lesson’s instructions', () => {
  it('are read out of its markdown, in order', () => {
    const markdown =
      'Press [Enhance Hero…](#clickable=map.enhance:Hero), then ' +
      '[World](#clickable=view.world). A [link](https://example.org) is not one.';
    expect(clickableNames(markdown)).toEqual([
      'map.enhance:Hero',
      'view.world',
    ]);
  });
});
