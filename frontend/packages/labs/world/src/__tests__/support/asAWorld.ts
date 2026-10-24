// A scenario in the shape before the Main Screen, for a test about the
// `.world` shape itself: a world that loads the scenario's level, with
// `main` as its own main map (specs/SCREEN_MAP_PLAN.md, step 5).
//
// No scenario holds a world any more, and the things only a world has — its
// own cameras, a Viewport placed on its main map that mirrors it — are still
// compiled until the shape is deleted. Built here, from the scenario's own
// files, rather than kept as a second copy of each scenario.

/** `files` with its Main Screen replaced by a world loading `maps/main`. */
export function asAWorld(
  files: Readonly<Record<string, string>>,
  main: object = {},
): Record<string, string> {
  const world = {...files};
  delete world['screens/main.screen'];
  world['worlds/main.world'] = JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'World'},
          next: {
            block: {type: 'world_load_map', fields: {MAP: 'maps/main'}},
          },
        },
      ],
    },
    map: {type: 'map', actors: [], ...main},
  });
  return world;
}
