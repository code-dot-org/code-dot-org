// What an actor looks like and how big it is drawn, read off its data and
// changed in it. The part that can go silently wrong is the writing: two
// answers to what an actor looks like, or to its scale, is an actor where the
// last one wins and nothing says so.

import {describe, expect, it} from 'vitest';

import {actorDocument, type ActorSpec} from '../../actorDocument';
import {lookOf, withLook, withScale} from '../actorLook';

const actor = (spec: Partial<ActorSpec> = {}) =>
  actorDocument({name: 'Chaser', ...spec});

const SCALE = 'world_set_Space_ScaleProperty';

/** The scale the actor's data sets, if it sets one. */
const scaleIn = (contents: string) =>
  (
    JSON.parse(contents) as {
      values?: Array<{setter: string; value: unknown}>;
    }
  ).values?.find(one => one.setter === SCALE)?.value;

describe('reading a look', () => {
  it('finds a still picture', () => {
    expect(lookOf(actor({sprite: 'coin.png'}))).toEqual({
      kind: 'sprite',
      value: 'coin.png',
    });
  });

  it('says nothing for an actor that paints itself', () => {
    // A real answer rather than a missing one: an interface actor draws its
    // own picture and must not carry one over the top (`specs/UI_ACTORS.md`).
    expect(lookOf(actor({traits: ['Writing#ShowsTextTrait']}))).toBeUndefined();
    expect(lookOf(actor())).toBeUndefined();
  });
});

describe('changing a look', () => {
  it('gives a picture to an actor that had none', () => {
    const after = withLook(actor({traits: ['A#B']}), {
      kind: 'sprite',
      value: 'coin.png',
    });

    expect(lookOf(after)).toEqual({kind: 'sprite', value: 'coin.png'});
    expect(JSON.parse(after).traits).toEqual(['A#B']);
  });

  it('REPLACES the one that was there, rather than adding a second', () => {
    const after = withLook(actor({sprite: 'coin.png'}), {
      kind: 'animation',
      value: 'coinSpin',
    });

    // An animation from the library is the actor's own Main
    // (specs/ANIMATION_PLAN.md), in the picture's place.
    const written = JSON.parse(after);
    expect(Object.keys(written.animations)).toEqual(['Main']);
    expect(written.animations.Main.tracks.sprite).toHaveLength(7);
  });

  it('keeps the actor’s other animations', () => {
    const after = withLook(
      actor({sprite: 'coin.png', animations: {Hop: {tracks: {}}}}),
      {kind: 'sprite', value: 'crawler.png'},
    );

    expect(Object.keys(JSON.parse(after).animations).sort()).toEqual([
      'Hop',
      'Main',
    ]);
    expect(lookOf(after)).toEqual({kind: 'sprite', value: 'crawler.png'});
  });

  it('leaves a file that is not an actor alone', () => {
    const empty = JSON.stringify({blocks: {blocks: []}});

    expect(withLook(empty, {kind: 'sprite', value: 'coin.png'})).toBe(empty);
  });
});

describe('how many tiles it fills', () => {
  it('writes nothing for the one tile every actor already is', () => {
    const same = actor({sprite: 'coin.png'});

    expect(withScale(same, {x: 1, y: 1})).toBe(same);
  });

  it('writes the shape itself for a square picture', () => {
    const out = withScale(
      actor({sprite: 'coin.png'}),
      {x: 1, y: 2},
      {width: 512, height: 512},
    );

    expect(scaleIn(out)).toEqual({x: 1, y: 2});
  });

  it('corrects for a picture that is not square', () => {
    // THE REPORTED GAPS. A provider offers 2:3 as its nearest shape to 1:2, so
    // an actor asked for one tile across and two up was drawn from a 1024 by
    // 1536 picture: fitted to a tile that is 21 by 32, and scaling by (1, 2)
    // drew it 21 wide. A row of them on a 32-pixel grid stood ten pixels
    // apart, with no trimming involved.
    const out = withScale(
      actor({sprite: 'totem.png'}),
      {x: 1, y: 2},
      {width: 1024, height: 1536},
    );

    // 1 x 1536/1024 across, 2 x 1536/1536 up — which draws it 32 by 64.
    expect(scaleIn(out)).toEqual({x: 1.5, y: 2});
  });

  it('corrects a wide picture the other way', () => {
    const out = withScale(
      actor({sprite: 'bar.png'}),
      {x: 3, y: 2},
      {width: 1536, height: 1024},
    );

    expect(scaleIn(out)).toEqual({x: 3, y: 3});
  });

  it('keeps the old arithmetic where nothing measured the picture', () => {
    // A picture chosen from the project's own grid is art the learner picked
    // rather than art composed to this shape.
    const out = withScale(actor({sprite: 'coin.png'}), {x: 2, y: 3});

    expect(scaleIn(out)).toEqual({x: 2, y: 3});
  });

  it('replaces the scale rather than adding a second', () => {
    const once = withScale(actor({sprite: 'coin.png'}), {x: 2, y: 2});
    const twice = withScale(once, {x: 1, y: 3});

    expect(JSON.parse(twice).values).toEqual([
      {setter: SCALE, type: 'vector', value: {x: 1, y: 3}},
    ]);
  });
});
