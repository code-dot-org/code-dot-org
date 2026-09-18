// Generates a tiny "thumbnail manifest" module the compile surface bundles and
// the preview surface renders: it imports a world (for its rules + registered
// animations, so an actor's frame resolves correctly) and every actor template
// to preview, and default-exports them for the sandbox's thumbnail renderer.
// Kept separate from the game's entry world so rendering the picker never
// disturbs the running game.

const quote = (value: string): string => JSON.stringify(value);

export function thumbnailManifest(
  actorPaths: string[],
  worldPath: string,
): string {
  // The world's own actors come with the world. They are not modules and have
  // no path — that is what makes them the world's — so an importer cannot name
  // one; the module hands them over instead, keyed by the type a placed one
  // carries (`assembleWorldModule`, MAPS.md §5). Without this the map editor
  // would draw an actor it can say nothing about.
  const imports = [`import W from ${quote(worldPath)};`];
  const entries: string[] = [];
  actorPaths.forEach((path, index) => {
    imports.push(`import M${index} from ${quote(path)};`);
    entries.push(`{type: ${quote(path)}, builder: M${index}}`);
  });
  return (
    `${imports.join('\n')}\n` +
    `export default {world: W, actors: [${entries.join(', ')}]};\n`
  );
}

/** A map with nothing in it, as a module the manifest's world can import. */
const EMPTY_MAP = JSON.stringify({type: 'map', actors: []});

/**
 * A map with its placements taken out and its own workspace kept.
 *
 * The placements are what an edit changes and what nothing in the manifest
 * reads; the map's own workspace declares the events a world's hat imports
 * by name (`parseMapOwnMeta`), and a stub without them would fail the bundle
 * on a missing export. So the stub keeps that one part, and a map edit still
 * leaves the bundle where it was unless it touched the map's events.
 */
const stubMap = (contents: string): string => {
  try {
    const parsed = JSON.parse(contents) as {blocks?: unknown};
    return parsed.blocks
      ? JSON.stringify({type: 'map', actors: [], blocks: parsed.blocks})
      : EMPTY_MAP;
  } catch {
    return EMPTY_MAP;
  }
};

/**
 * A world with its main map's placements taken out (specs/MAIN_MAP_PLAN.md),
 * for the reason a `.map`'s are: a placement edit must not recompile the
 * manifest. A world with no map, or one that will not parse, is left alone.
 */
const stubWorld = (contents: string): string => {
  try {
    const parsed = JSON.parse(contents) as {map?: {actors?: unknown}};
    if (!parsed.map?.actors) {
      return contents;
    }
    return JSON.stringify({...parsed, map: {...parsed.map, actors: []}});
  } catch {
    return contents;
  }
};

/**
 * The project's files as the manifest compile should see them: every `.map`
 * replaced by an empty one.
 *
 * The compile is content-addressed, so a bundle built from the same files is
 * a cache hit and costs no esbuild at all. The manifest imports the world and
 * the actors, and the world imports its maps — so an edit to a map changed
 * the bundle, and every keystroke in the map editor's inspector paid for a
 * whole compile to draw one placement. Nothing the sandbox draws from the
 * manifest reads a map: the kinds come from the actor modules and the
 * placements from the request. So the maps are stubbed, the import still
 * resolves, and a map edit leaves the bundle where it was.
 */
export function manifestFiles(
  files: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [path, contents] of Object.entries(files)) {
    out[path] = path.endsWith('.map')
      ? stubMap(contents)
      : path.endsWith('.world')
        ? stubWorld(contents)
        : contents;
  }
  return out;
}
