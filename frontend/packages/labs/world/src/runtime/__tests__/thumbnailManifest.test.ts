// The module the sandbox introspects actors through.
//
// It exists so the map editor can say what an actor's editable properties are,
// which it learns by building one and looking. That works by importing every
// actor MODULE — and a world's own actors are not modules, so they arrive the
// only way they can: from the world, which is imported here anyway (MAPS.md §5).
//
// The manifest is source text, so these read it as text. What it has to be is
// valid, complete, and honest about where each entry came from.

import {describe, expect, it} from 'vitest';

import {manifestFiles, thumbnailManifest} from '../thumbnailManifest';

describe('thumbnailManifest', () => {
  it('imports the world and every actor module', () => {
    const code = thumbnailManifest(
      ['actors/coin', 'actors/player'],
      'worlds/main',
    );

    expect(code).toContain('import W from "worlds/main";');
    expect(code).toContain('import M0 from "actors/coin";');
    expect(code).toContain('import M1 from "actors/player";');
    expect(code).toContain('{type: "actors/coin", builder: M0}');
    expect(code).toContain('{type: "actors/player", builder: M1}');
  });

  it('is valid with no actor modules at all', () => {
    const code = thumbnailManifest([], 'worlds/main');

    expect(code).toContain('actors: []');
  });

  it('parses as a module', () => {
    // Cheap syntax check: the manifest is assembled by string concatenation, so
    // a missing bracket is a real risk and a silent one until the sandbox
    // imports it.
    const code = thumbnailManifest(['actors/coin'], 'worlds/main');

    const body = code
      .replace(/^import .*$/gm, '')
      .replace(/^export default /gm, 'const theDefault = ')
      .replace(/^export \{[^}]*\};$/gm, '');
    expect(() => new Function(body)).not.toThrow();
  });
});

describe('manifestFiles', () => {
  it('replaces every map with an empty one and leaves the rest alone', () => {
    // The compile is content-addressed: with the maps stubbed, a map edit
    // leaves the manifest's bundle where it was and costs no esbuild.
    const files = {
      'worlds/main.world': '{"blocks":{}}',
      'actors/label.actor': '{"blocks":{}}',
      'maps/interface.map': '{"type":"map","actors":[{"type":"actors/label"}]}',
    };
    const stubbed = manifestFiles(files);
    expect(Object.keys(stubbed).sort()).toEqual(Object.keys(files).sort());
    expect(stubbed['worlds/main.world']).toBe(files['worlds/main.world']);
    expect(stubbed['actors/label.actor']).toBe(files['actors/label.actor']);
    expect(JSON.parse(stubbed['maps/interface.map'])).toEqual({
      type: 'map',
      actors: [],
    });
  });

  it('gives two projects that differ only in a map the same files', () => {
    const before = manifestFiles({'maps/a.map': '{"type":"map","actors":[]}'});
    const after = manifestFiles({
      'maps/a.map': '{"type":"map","actors":[{"type":"actors/coin"}]}',
    });
    expect(after).toEqual(before);
  });

  it('keeps a map’s own workspace, whose events a world imports by name', () => {
    // A stub without them would fail the bundle on a missing export
    // (specs/MAP_FIRST.md); a placement's workspace is not kept, since
    // nothing in the manifest reads one.
    const blocks = {blocks: {blocks: [{type: 'world_rule_event'}]}};
    const stubbed = manifestFiles({
      'maps/menu.map': JSON.stringify({
        type: 'map',
        actors: [{type: 'actors/button', id: 'Quit', blocks}],
        blocks,
      }),
    });
    expect(JSON.parse(stubbed['maps/menu.map'])).toEqual({
      type: 'map',
      actors: [],
      blocks,
    });
  });
});
