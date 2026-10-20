// What a world's code says about its cameras (`worldCameraCode`): a camera a
// learner wrote as blocks, which the map editor lists as "in code".

import {describe, expect, it} from 'vitest';

import {startingCamera} from '../worldCameraCode';
import {worldCameras} from '../worldCameras';

/** A world that defines Chase in its code and starts looking through it. */
const world = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        fields: {NAME: 'W'},
        next: {
          block: {
            type: 'world_define_camera',
            id: 'chase',
            fields: {NAME: 'Chase'},
            next: {
              block: {
                type: 'world_use_camera',
                fields: {CAMERA: 'camera:chase'},
              },
            },
          },
        },
      },
    ],
  },
});
const chase = worldCameras(world)[0];
describe('reading a world’s code about its cameras', () => {
  it('knows which camera the code starts the world with', () => {
    expect(chase.name).toBe('Chase');
    expect(startingCamera(world)).toBe(chase.id);
  });
});
