// A Viewport's cameras as map data (`mapModel`), and the declarations the
// compiler makes of them (`blockly/placementCameras`).

import {describe, expect, it} from 'vitest';

import {withCameraHandler} from '../../blockly/placementCameras';
import {
  addPlacementCamera,
  removePlacementCamera,
  renamePlacementCamera,
  showsThroughOf,
  withMapCameraTrait,
  withMapCameraValue,
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

describe('the declarations the compiler makes of them', () => {
  it('is one `when created`, FIRST and above the learner’s own', () => {
    const mine = {
      blocks: {
        blocks: [{type: 'world_on_Space_CreatedEvent', x: 20, y: 20}],
      },
    };
    const made = withCameraHandler(mine, [
      {
        id: 'wide',
        name: 'Wide',
        traits: ['Camera Follow#FollowsTrait'],
        values: [{setter: FOLLOW, type: 'actor', value: 'actors/pilot'}],
      },
    ]) as {blocks: {blocks: Array<{type: string; y?: number; next?: unknown}>}};
    const [hidden, theirs] = made.blocks.blocks;
    expect(hidden.type).toBe('world_on_Space_CreatedEvent');
    expect(hidden.y!).toBeLessThan(theirs.y!);
    expect(JSON.stringify(hidden)).toContain('"NAME":"Wide"');
    expect(JSON.stringify(hidden)).toContain('world_this_actor');
  });

  it('leaves a placement with no cameras as it was', () => {
    const state = {blocks: {blocks: []}};
    expect(withCameraHandler(state, undefined)).toBe(state);
    expect(withCameraHandler(undefined, [])).toBeUndefined();
  });
});

describe('the world’s main camera, on its main map', () => {
  it('takes traits and values apart from the cameras the world adds', () => {
    const follows = withMapCameraTrait(
      MAP,
      'main',
      'Camera Follow#FollowsTrait',
      true,
    );
    const aimed = withMapCameraValue(follows, 'main', {
      setter: FOLLOW,
      type: 'actor',
      value: 'actors/pilot',
    });
    expect(aimed.mainCamera).toEqual({
      traits: ['Camera Follow#FollowsTrait'],
      values: [{setter: FOLLOW, type: 'actor', value: 'actors/pilot'}],
    });
    expect(aimed.cameras).toBeUndefined();
    // …and nothing left takes the key away.
    const plain = withMapCameraValue(
      withMapCameraTrait(aimed, 'main', 'Camera Follow#FollowsTrait', false),
      'main',
      {setter: FOLLOW, type: 'actor', value: ''},
    );
    expect(plain.mainCamera).toBeUndefined();
  });
});
