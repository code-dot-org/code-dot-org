// Generates a tiny "thumbnail manifest" module the compile surface bundles and
// the preview surface renders: it imports a world (for its rules + registered
// animations, so an actor's frame resolves correctly) and every actor template
// to preview, and default-exports them for the sandbox's thumbnail renderer.
// Kept separate from the scene entry so rendering the picker never disturbs the
// running game.

const quote = (value: string): string => JSON.stringify(value);

export function thumbnailManifest(
  actorPaths: string[],
  worldPath: string,
): string {
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
