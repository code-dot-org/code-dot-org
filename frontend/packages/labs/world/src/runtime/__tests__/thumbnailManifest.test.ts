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

import {thumbnailManifest} from '../thumbnailManifest';

describe('thumbnailManifest', () => {
  it('imports the world for its own actors, alongside the modules', () => {
    const code = thumbnailManifest(
      ['actors/coin', 'actors/player'],
      'worlds/main',
    );

    expect(code).toContain('import W, {localActors} from "worlds/main";');
    expect(code).toContain('import M0 from "actors/coin";');
    expect(code).toContain('import M1 from "actors/player";');
    expect(code).toContain('{type: "actors/coin", builder: M0}');
    expect(code).toContain('{type: "actors/player", builder: M1}');
  });

  it('spreads the world’s own actors in, keyed by their type', () => {
    // The key is what a placed one carries, which is what `schemas[type]` is
    // looked up by — the same string `add actor` stamps.
    const code = thumbnailManifest([], 'worlds/main');

    expect(code).toContain(
      'Object.entries(localActors ?? {}).map(([type, builder]) => ({type, builder}))',
    );
  });

  it('is valid with no actor modules at all', () => {
    // A world whose only actors are its own. The list must not begin with a
    // stray comma, which is the way a template like this usually breaks.
    const code = thumbnailManifest([], 'worlds/main');

    expect(code).not.toContain('[, ');
    expect(code).toContain('actors: [...Object.entries');
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
