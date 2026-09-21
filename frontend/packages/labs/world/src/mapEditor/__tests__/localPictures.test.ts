// What the editor paints for itself, and what it leaves to the sandbox.

import {describe, expect, it} from 'vitest';

import type {Files} from '../../actors/preview/drawingReader';
import {STOCK_ACTORS} from '../../actors/stock';
import {placementKey} from '../../blockly/mapPlacements';
import {STOCK_RULES} from '../../rules/stock';
import type {ActorSchema} from '../../runtime/messages';
import {
  drawsItself,
  localPictures,
  withoutWornPicture,
  type LocalPicture,
} from '../localPictures';
import type {MapDoc} from '../mapModel';

const SHELF: Files = Object.fromEntries([
  ...STOCK_ACTORS.map(actor => [`actors/${actor.id}.actor`, actor.contents]),
  ...STOCK_RULES.map(rule => [`rules/${rule.id}.rule`, rule.contents]),
]);

/** No canvas here; the painter is stood in for and counted. */
const painter = () => {
  let painted = 0;
  return {
    paint: () => {
      painted++;
      return undefined;
    },
    count: () => painted,
  };
};

const doc = (actors: MapDoc['actors']): MapDoc => ({
  type: 'map',
  size: {width: 10, height: 10},
  tile: {width: 32, height: 32},
  actors,
});

describe('localPictures', () => {
  const title = {
    type: 'actors/label',
    id: 'Title',
    properties: {
      positional: {position: {x: 160, y: 30}},
      Label: {text: 'WHAT IS YOUR NAME?'},
      hasABox: {width: 200},
    },
  };
  const key = placementKey(title.type, title.properties)!;

  it('reads a size for a placement and finishes it', () => {
    const {paint} = painter();
    const local = localPictures(
      SHELF,
      doc([title]),
      ['actors/label', 'actors/coin'],
      undefined,
      () => undefined,
      new Map(),
      paint,
    );
    expect(local.sizes[key]).toEqual({width: 200, height: 24});
    expect(local.complete.has(key)).toBe(true);
    // The kind too, and nothing for one that wears a picture.
    expect(local.sizes['actors/label']).toEqual({width: 96, height: 24});
    expect('actors/coin' in local.sizes).toBe(false);
  });

  it('reads each key once for one set of files', () => {
    const {paint, count} = painter();
    const cache = new Map<string, LocalPicture | null>();
    localPictures(
      SHELF,
      doc([title]),
      ['actors/label'],
      undefined,
      () => undefined,
      cache,
      paint,
    );
    localPictures(
      SHELF,
      doc([title, {...title, id: 'Again'}]),
      ['actors/label'],
      undefined,
      () => undefined,
      cache,
      paint,
    );
    // The kind and the one distinct placement: two readings, not four.
    expect(count()).toBe(2);
  });

  it('leaves a placement it could not finish out of `complete`', () => {
    const field = {
      type: 'actors/textInput',
      id: 'Name',
      properties: {hasABox: {width: 120}},
    };
    const local = localPictures(
      SHELF,
      doc([field]),
      [],
      undefined,
      () => undefined,
      new Map(),
      painter().paint,
    );
    const fieldKey = placementKey(field.type, field.properties)!;
    expect(local.sizes[fieldKey]).toEqual({width: 120, height: 28});
    expect(local.complete.has(fieldKey)).toBe(false);
  });
});

describe('withoutWornPicture', () => {
  const appearance = {
    trait: 'appearance',
    traitName: 'Has Appearance',
    props: [
      {ownerId: 'appearance', propId: 'sprite', name: 'sprite', type: 'string'},
      {
        ownerId: 'appearance',
        propId: 'animation',
        name: 'animation',
        type: 'string',
      },
      {
        ownerId: 'appearance',
        propId: 'opacity',
        name: 'opacity',
        type: 'number',
      },
    ],
  } as unknown as ActorSchema[number];
  const own = {
    trait: 'actors/label',
    traitName: 'Label',
    props: [{ownerId: 'Label', propId: 'text', name: 'text', type: 'string'}],
  } as unknown as ActorSchema[number];

  it('drops sprite and animation for a kind that draws itself', () => {
    const shown = withoutWornPicture(
      {'actors/label': [appearance, own], 'actors/coin': [appearance]},
      type => type === 'actors/label',
    );
    expect(shown['actors/label'][0].props.map(prop => prop.propId)).toEqual([
      'opacity',
    ]);
    expect(shown['actors/label'][1]).toBe(own);
    expect(shown['actors/coin']).toEqual([appearance]);
  });

  it('drops the group when nothing is left in it', () => {
    const bare = {...appearance, props: appearance.props.slice(0, 2)};
    const shown = withoutWornPicture({'actors/label': [bare, own]}, () => true);
    expect(shown['actors/label']).toEqual([own]);
  });

  it('asks the file whether a kind draws itself', () => {
    expect(drawsItself(SHELF, 'actors/button')).toBe(true);
    expect(drawsItself(SHELF, 'actors/coin')).toBe(false);
  });
});
