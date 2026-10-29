// A Viewport's camera as map data (`mapModel`), and the set-up the compiler
// makes of it (`blockly/placementCameras`).

import {describe, expect, it} from 'vitest';

import {
  CAMERA_SETTINGS_ID,
  withCameraSettings,
} from '../../blockly/placementCameras';
import {
  withPlacementCameraZoom,
  withPlacementCameraTrait,
  withPlacementCameraValue,
  type MapDoc,
} from '../mapModel';

const MAP: MapDoc = {
  size: {width: 10, height: 10},
  tile: {width: 32, height: 32},
  actors: [{type: 'actors/viewport', id: 'Mini'}],
} as unknown as MapDoc;
const mini = (doc: MapDoc) => doc.actors.find(actor => actor.id === 'Mini')!;
const FOLLOW = 'world_set_CameraFollow_ActorToFollowProperty';

describe('a Viewport’s camera in the map', () => {
  it('says nothing until something is set on it', () => {
    expect(mini(MAP).camera).toBeUndefined();
  });

  it('elects traits and sets values, and following nobody takes one away', () => {
    const follows = withPlacementCameraTrait(
      MAP,
      'Mini',
      'Camera Follow#FollowsTrait',
      true,
    );
    const aimed = withPlacementCameraValue(follows, 'Mini', {
      setter: FOLLOW,
      type: 'actor',
      value: 'actors/pilot',
    });
    expect(mini(aimed).camera).toMatchObject({
      traits: ['Camera Follow#FollowsTrait'],
      values: [{setter: FOLLOW, value: 'actors/pilot'}],
    });
    const nobody = withPlacementCameraValue(aimed, 'Mini', {
      setter: FOLLOW,
      type: 'actor',
      value: '',
    });
    expect(mini(nobody).camera!.values).toEqual([]);
    const unelected = withPlacementCameraTrait(
      nobody,
      'Mini',
      'Camera Follow#FollowsTrait',
      false,
    );
    expect(mini(unelected).camera!.traits).toEqual([]);
  });
});

describe('a camera’s zoom', () => {
  it('is kept with the camera, and 1 is kept as nothing', () => {
    const wide = withPlacementCameraZoom(MAP, 'Mini', 0.5);
    expect(mini(wide).camera!.zoom).toBe(0.5);
    const back = withPlacementCameraZoom(wide, 'Mini', 1);
    expect(mini(back).camera).not.toHaveProperty('zoom');
  });
});

describe('the rows the compiler makes of it', () => {
  it('is one stack of `set` rows on `this camera`, beside the placement’s own', () => {
    const mine = {
      blocks: {
        blocks: [{type: 'world_on_Space_CreatedEvent', x: 20, y: 20}],
      },
    };
    const camera = {
      traits: ['Camera Follow#FollowsTrait'],
      values: [{setter: FOLLOW, type: 'actor', value: 'actors/pilot'}],
    };
    const made = withCameraSettings(mine, camera) as {
      blocks: {blocks: Array<{type: string; id?: string}>};
    };
    const [settings, theirs] = made.blocks.blocks;
    expect(settings).toMatchObject({type: FOLLOW, id: CAMERA_SETTINGS_ID});
    expect(JSON.stringify(settings)).toContain('world_this_camera');
    expect(theirs.type).toBe('world_on_Space_CreatedEvent');
  });

  it('leaves a placement whose camera sets nothing as it was', () => {
    const state = {blocks: {blocks: []}};
    const bare = {traits: [], values: []};
    expect(withCameraSettings(state, undefined)).toBe(state);
    expect(withCameraSettings(state, bare)).toBe(state);
    expect(withCameraSettings(undefined, undefined)).toBeUndefined();
  });
});
