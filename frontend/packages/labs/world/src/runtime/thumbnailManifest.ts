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
  const imports = [`import W, {localActors} from ${quote(worldPath)};`];
  const entries: string[] = [];
  actorPaths.forEach((path, index) => {
    imports.push(`import M${index} from ${quote(path)};`);
    entries.push(`{type: ${quote(path)}, builder: M${index}}`);
  });
  const own =
    `Object.entries(localActors ?? {})` +
    `.map(([type, builder]) => ({type, builder}))`;
  return (
    `${imports.join('\n')}\n` +
    `export default {world: W, actors: [${
      entries.length ? `${entries.join(', ')}, ` : ''
    }...${own}]};\n`
  );
}
