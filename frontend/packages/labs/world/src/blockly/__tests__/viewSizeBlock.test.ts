// `set size of view`, from the block to the running world.
//
// The unit tests either side of this one cover the arithmetic — `World` moves a
// resting camera, `backdropPlacement` sizes a sky. What neither covers is the
// wiring: a generator that emits the wrong method name, or a block the toolbox
// offers and the compiler cannot build, fails in a way that reads as "the block
// does nothing" and nothing else notices.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';

/** The empty scenario, with its world saying how much of itself to show. */
const showing = (columns: number, rows: number) => {
  const source = WORLD_SCENARIOS.empty.source;
  const file = Object.values(source.files).find(
    one => one.name === 'main.world',
  )!;
  const tiles = (value: number) => ({
    block: {type: 'math_number', fields: {NUM: value}},
  });
  return {
    ...source,
    files: {
      ...source.files,
      [file.id]: {
        ...file,
        contents: JSON.stringify({
          blocks: {
            blocks: [
              {
                type: 'world_world',
                x: 20,
                y: 20,
                fields: {NAME: 'My World'},
                next: {
                  block: {
                    type: 'world_set_view_size',
                    inputs: {X: tiles(columns), Y: tiles(rows)},
                  },
                },
              },
            ],
          },
        }),
      },
    },
  };
};

describe('a world that says how much of itself is on screen', () => {
  it('is built at that size, in pixels', async () => {
    // 26 by 16 is a jetpack room: the whole level visible at once, which is
    // what the ten-tile square could not be asked for.
    const {world} = await compileProject(projectFiles(showing(26, 16)));

    expect(world.viewSize()).toEqual({x: 832, y: 512});
  });

  it('frames it from the middle, so the level is not half off the edge', async () => {
    // The camera is the thing that would silently be wrong: it rests in the
    // middle of the view, and a camera left in the middle of the STANDARD one
    // shows the left-hand third of the room with black either side.
    const {world} = await compileProject(projectFiles(showing(26, 16)));
    const [camera] = world.cameraSnapshot();

    expect(camera.position).toEqual({x: 416, y: 256});
  });

  it('leaves a world that says nothing exactly as it was', async () => {
    const {world} = await compileProject(
      projectFiles(WORLD_SCENARIOS.empty.source),
    );

    expect(world.viewSize()).toEqual({x: 320, y: 320});
  });
});
