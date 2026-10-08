// What a world's code says about its cameras (`worldCameraCode`), against
// the one starter world that declares one: Flappy's Chase.

import {describe, expect, it} from 'vitest';

import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {startingCamera} from '../worldCameraCode';
import {worldCameras} from '../worldCameras';

const flappy = Object.entries(projectFiles(WORLD_SCENARIOS.flappy.source)).find(
  ([path]) => path.endsWith('.world'),
)![1];
const chase = worldCameras(flappy)[0];
describe('reading a world’s code about its cameras', () => {
  it('knows which camera the code starts the world with', () => {
    expect(chase.name).toBe('Chase');
    expect(startingCamera(flappy)).toBe(chase.id);
  });
});
