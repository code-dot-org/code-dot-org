// A Viewport's cameras as map data (`mapModel`), and the declarations the
// compiler makes of them (`blockly/placementCameras`).

import {describe, expect, it} from 'vitest';

import {
  settingsBlockId,
  withCameraSettings,
} from '../../blockly/placementCameras';
import {
  addPlacementCamera,
  withPlacementCameraZoom,
  removePlacementCamera,
  renamePlacementCamera,
  showsThroughOf,
  withPlacementCameraTrait,
  withPlacementCameraValue,
  withShowsThrough,
  type MapDoc,
} from '../mapModel';

const MAP: MapDoc = {
  size: {width: 10, height: 10},
  tile: {width: 32, height: 32},
  actors: [{type: 'actors/viewport', id: 'Mini'}],
} as unknown as MapDoc;
const mini = (doc: MapDoc) => doc.actors.find(actor => actor.id === 'Mini')!;
const FOLLOW = 'world_set_CameraFollow_ActorToFollowProperty';

describe('a Viewport’s cameras in the map', () => {
  it('adds one, named after the main camera and the ones before', () => {
    const {doc, id} = addPlacementCamera(MAP, 'Mini');
    expect(mini(doc).cameras).toEqual([
      {id, name: 'Camera 2', traits: [], values: []},
    ]);
    const second = addPlacementCamera(doc, 'Mini');
    expect(mini(second.doc).cameras![1].name).toBe('Camera 3');
    expect(second.id).not.toBe(id);
  });

  it('keeps looking through a camera that is renamed', () => {
    const {doc, id} = addPlacementCamera(MAP, 'Mini');
    const through = withShowsThrough(doc, 'Mini', 'Camera 2');
    const renamed = renamePlacementCamera(through, 'Mini', id, 'Wide');
    expect(mini(renamed).cameras![0].name).toBe('Wide');
    expect(showsThroughOf(mini(renamed))).toBe('Wide');
  });

  it('goes back to the main camera when the one it showed is removed', () => {
    const {doc, id} = addPlacementCamera(MAP, 'Mini');
    const through = withShowsThrough(doc, 'Mini', 'Camera 2');
    const gone = removePlacementCamera(through, 'Mini', id);
    expect(mini(gone).cameras).toBeUndefined();
    expect(showsThroughOf(mini(gone))).toBe('');
  });

  it('elects traits and sets values, and following nobody takes one away', () => {
    const {doc, id} = addPlacementCamera(MAP, 'Mini');
    const follows = withPlacementCameraTrait(
      doc,
      'Mini',
      id,
      'Camera Follow#FollowsTrait',
      true,
    );
    const aimed = withPlacementCameraValue(follows, 'Mini', id, {
      setter: FOLLOW,
      type: 'actor',
      value: 'actors/pilot',
    });
    expect(mini(aimed).cameras![0]).toMatchObject({
      traits: ['Camera Follow#FollowsTrait'],
      values: [{setter: FOLLOW, value: 'actors/pilot'}],
    });
    const nobody = withPlacementCameraValue(aimed, 'Mini', id, {
      setter: FOLLOW,
      type: 'actor',
      value: '',
    });
    expect(mini(nobody).cameras![0].values).toEqual([]);
  });
});

describe('a camera’s zoom', () => {
  it('is kept with the camera, and 1 is kept as nothing', () => {
    const {doc, id} = addPlacementCamera(MAP, 'Mini');
    const wide = withPlacementCameraZoom(doc, 'Mini', id, 0.5);
    expect(mini(wide).cameras![0].zoom).toBe(0.5);
    const back = withPlacementCameraZoom(wide, 'Mini', id, 1);
    expect(mini(back).cameras![0]).not.toHaveProperty('zoom');
  });
});

describe('the rows the compiler makes of them', () => {
  it('is one stack of `set` rows on `this camera`, beside the placement’s own', () => {
    const mine = {
      blocks: {
        blocks: [{type: 'world_on_Space_CreatedEvent', x: 20, y: 20}],
      },
    };
    const wide = {
      id: 'wide',
      name: 'Wide',
      traits: ['Camera Follow#FollowsTrait'],
      values: [{setter: FOLLOW, type: 'actor', value: 'actors/pilot'}],
    };
    const made = withCameraSettings(mine, [wide]) as {
      blocks: {blocks: Array<{type: string; id?: string}>};
    };
    const [settings, theirs] = made.blocks.blocks;
    expect(settings).toMatchObject({type: FOLLOW, id: settingsBlockId(wide)});
    expect(JSON.stringify(settings)).toContain('world_this_camera');
    expect(theirs.type).toBe('world_on_Space_CreatedEvent');
  });

  it('leaves a placement whose cameras set nothing as it was', () => {
    const state = {blocks: {blocks: []}};
    const bare = {id: 'wide', name: 'Wide', traits: [], values: []};
    expect(withCameraSettings(state, undefined)).toBe(state);
    expect(withCameraSettings(state, [bare])).toBe(state);
    expect(withCameraSettings(undefined, [])).toBeUndefined();
  });
});
