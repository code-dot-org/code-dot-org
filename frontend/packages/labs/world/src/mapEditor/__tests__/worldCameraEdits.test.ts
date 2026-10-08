// A world's cameras edited from the map editor (`worldCameraEdits`), against
// the one starter world that declares one: Flappy's Chase.

import {describe, expect, it} from 'vitest';

import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {
  addWorldCamera,
  cameraPropertyValue,
  cameraTraitValues,
  MAIN_CAMERA,
  removeWorldCamera,
  renameWorldCamera,
  setCameraProperty,
  setCameraTrait,
  setStartingCamera,
  startingCamera,
} from '../worldCameraEdits';
import {worldCameras} from '../worldCameras';

const flappy = Object.entries(projectFiles(WORLD_SCENARIOS.flappy.source)).find(
  ([path]) => path.endsWith('.world'),
)![1];
const chase = worldCameras(flappy)[0];
const FOLLOW = {
  setter: 'world_set_CameraFollow_ActorToFollowProperty',
  name: 'actor to follow',
  type: 'actor',
};
const OFFSET = {
  setter: 'world_set_CameraFollow_LookOffsetProperty',
  name: 'look offset',
  type: 'point',
};

describe('reading a world’s cameras', () => {
  it('knows which one the world starts with, and what it elects', () => {
    expect(chase.name).toBe('Chase');
    expect(startingCamera(flappy)).toBe(chase.id);
    expect(cameraTraitValues(flappy, chase.id)).toEqual([
      'Camera Follow#FollowsTrait',
      'Camera Confined#ConfinedToTheMapTrait',
    ]);
    expect(cameraPropertyValue(flappy, chase.id, FOLLOW)).toBe('actors/bird');
  });
});

describe('editing a world’s cameras', () => {
  it('adds one at the end of the world, and removes it again', () => {
    const {contents, id} = addWorldCamera(flappy, 'Wide');
    expect(worldCameras(contents).map(each => each.name)).toEqual([
      'Chase',
      'Wide',
    ]);
    expect(worldCameras(removeWorldCamera(contents, id!))).toHaveLength(1);
  });

  it('renames one', () => {
    const renamed = renameWorldCamera(flappy, chase.id, 'Follow');
    expect(worldCameras(renamed)[0].name).toBe('Follow');
  });

  it('takes away the look-through row of a camera it removes', () => {
    const gone = removeWorldCamera(flappy, chase.id);
    expect(worldCameras(gone)).toEqual([]);
    expect(startingCamera(gone)).toBe(MAIN_CAMERA);
    expect(gone).not.toContain('world_use_camera');
  });

  it('starts through the main camera, or one row naming another', () => {
    const main = setStartingCamera(flappy, MAIN_CAMERA);
    expect(startingCamera(main)).toBe(MAIN_CAMERA);
    expect(main).not.toContain('world_use_camera');
    const back = setStartingCamera(main, chase.id);
    expect(startingCamera(back)).toBe(chase.id);
    expect(back.match(/world_use_camera/g)).toHaveLength(1);
  });

  it('elects a trait at the top of the mouth, and drops it', () => {
    const eased = setCameraTrait(
      flappy,
      chase.id,
      'Camera Ease#EasesTrait',
      true,
    );
    expect(cameraTraitValues(eased, chase.id)[0]).toBe(
      'Camera Ease#EasesTrait',
    );
    const plain = setCameraTrait(
      eased,
      chase.id,
      'Camera Ease#EasesTrait',
      false,
    );
    expect(cameraTraitValues(plain, chase.id)).toEqual(
      cameraTraitValues(flappy, chase.id),
    );
  });

  it('sets a property, changing the row it has or adding one', () => {
    const coin = setCameraProperty(flappy, chase.id, FOLLOW, 'actors/coin');
    expect(cameraPropertyValue(coin, chase.id, FOLLOW)).toBe('actors/coin');
    expect(coin.match(/ActorToFollowProperty/g)).toHaveLength(1);
    const offset = setCameraProperty(coin, chase.id, OFFSET, '0,-40');
    expect(cameraPropertyValue(offset, chase.id, OFFSET)).toBe('0,-40');
    // …and following nobody takes the row away.
    const nobody = setCameraProperty(offset, chase.id, FOLLOW, '');
    expect(cameraPropertyValue(nobody, chase.id, FOLLOW)).toBeUndefined();
  });
});
