// What the Actor Editor's panel changes (specs/ACTOR_EDITOR_PLAN.md, step 4).

import {describe, expect, it} from 'vitest';

import type {EffectParameter} from '../../../effect/model/types';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {projectFiles} from '../../../runtime/projectFiles';
import {
  actorView,
  asActorData,
  throughView,
  type ActorData,
} from '../../actorData';
import {
  actorTraitChoices,
  addEffect,
  addProperty,
  addTrait,
  effectSettings,
  literalOf,
  removeEffect,
  removeTrait,
  setEffectSetting,
  setLook,
  addAnimation,
  animationNames,
  removeAnimation,
  renameAnimation,
  addAnimationFrames,
  setActsLike,
  setIcon,
  setIsRecord,
  moveAnimationKey,
  removeAnimationKey,
  setAnimationKey,
  setAnimationLength,
  setAnimationLoop,
  setPropertyDefault,
  setValue,
  switchEffect,
  takesValue,
  type TraitChoice,
} from '../actorEdits';

const PLAYER: ActorData = {type: 'actor', name: 'Player'};

const STRENGTH = {
  setter: 'world_set_Gravity_StrengthProperty',
  name: 'strength',
  type: 'number',
  default: '5',
};
const GRAVITY: TraitChoice = {
  value: 'Gravity#AffectedByGravityTrait',
  name: 'Affected by Gravity',
  rule: 'Gravity',
  properties: [STRENGTH],
};

describe('the traits an actor may take', () => {
  it('are the project rules’ actor traits, with their setters', () => {
    const choices = actorTraitChoices(
      projectFiles(WORLD_SCENARIOS.simple.source),
    );
    const jumps = choices.find(choice => choice.value.endsWith('#JumpsTrait'));
    expect(jumps?.rule).toBe('Jumping');
    // A setter is a block type the palette mints, named after the property.
    for (const property of jumps!.properties) {
      expect(property.setter).toMatch(/^world_set_[A-Za-z0-9]+_\w+$/);
    }
    // No camera traits among them.
    expect(choices.every(choice => !choice.rule.startsWith('Camera'))).toBe(
      true,
    );
  });
});

describe('a trait', () => {
  it('is taken once, and goes with the values set on it', () => {
    const taken = addTrait(PLAYER, GRAVITY.value);
    expect(addTrait(taken, GRAVITY.value)).toBe(taken);
    const set = setValue(taken, STRENGTH, '9');
    expect(set.values).toEqual([
      {setter: STRENGTH.setter, type: 'number', value: 9},
    ]);

    const gone = removeTrait(set, GRAVITY);
    expect(gone.traits).toBeUndefined();
    expect(gone.values).toBeUndefined();
  });
});

describe('a value', () => {
  it('is taken away when set back to its own default', () => {
    const set = setValue(PLAYER, STRENGTH, '9');
    expect(setValue(set, STRENGTH, '5').values).toBeUndefined();
  });

  it('is not written from text that is not one', () => {
    expect(setValue(PLAYER, STRENGTH, 'lots')).toBe(PLAYER);
  });

  it('is read from text as the type says', () => {
    expect(literalOf('vector', '2, 3')).toEqual({
      type: 'vector',
      value: {x: 2, y: 3},
    });
    expect(literalOf('color', '#FF0000')).toEqual({
      type: 'color',
      value: '#ff0000',
    });
    expect(literalOf('words', 'one, two,')).toEqual({
      type: 'list',
      value: ['one', 'two'],
    });
    // One of the project's pictures, by file name; none is no value.
    expect(literalOf('picture', 'coin.png')).toEqual({
      type: 'picture',
      value: 'coin.png',
    });
    expect(literalOf('picture', '')).toBeUndefined();
    expect(takesValue('picture')).toBe(true);
    expect(literalOf('boolean', 'yes')).toBeUndefined();
    expect(takesValue('actor')).toBe(false);
    expect(takesValue('angle')).toBe(true);
  });
});

describe('a property of its own', () => {
  it('is added once, starting at its kind of nothing', () => {
    const added = addProperty(PLAYER, ' lives ', 'number');
    expect(added.properties).toEqual([
      {name: 'lives', type: 'number', access: 'writable', value: '0'},
    ]);
    expect(addProperty(added, 'lives', 'string')).toBe(added);
    expect(addProperty(added, '  ', 'number')).toBe(added);
    expect(setPropertyDefault(added, 'lives', '3').properties![0].value).toBe(
      '3',
    );
    expect(setPropertyDefault(added, 'ghost', '3')).toBe(added);
  });
});

describe('a look', () => {
  it('is set, and taken away', () => {
    // A picture is a still Main; nothing is no Main, and no look.
    const looking = setLook(PLAYER, {sprite: 'player.png'});
    expect(looking.animations).toEqual({
      Main: {loop: true, tracks: {sprite: [{at: 0, value: 'player.png'}]}},
    });
    const gone = setLook(looking, undefined);
    expect(gone.animations).toBeUndefined();
  });
});

describe('an effect', () => {
  const RIPPLE: EffectParameter[] = [
    {
      id: 'p1',
      name: 'strength',
      type: 'float',
      defaultValue: 0.5,
      min: 0,
      max: 1,
    },
    {id: 'p2', name: 'tint', type: 'vec3', defaultValue: [1, 0, 0]},
  ];

  it('is added on, with its settings at their defaults, and once', () => {
    const added = addEffect(PLAYER, 'effects/ripple', RIPPLE);
    expect(addEffect(added, 'effects/ripple', RIPPLE)).toBe(added);
    const [effect] = added.effects!;
    expect(effect).toMatchObject({effect: 'effects/ripple', on: true});
    expect(effectSettings(effect)).toEqual([
      expect.objectContaining({
        label: 'strength',
        type: 'number',
        value: '0.5',
      }),
      expect.objectContaining({label: 'tint', type: 'color', value: '#ff0000'}),
    ]);
  });

  it('is switched, set, and taken away', () => {
    let data = addEffect(PLAYER, 'effects/ripple', RIPPLE);
    data = switchEffect(data, 'effects/ripple', false);
    expect(data.effects![0].on).toBe(false);
    const [strength] = effectSettings(data.effects![0]);
    data = setEffectSetting(data, 'effects/ripple', strength, '0.9');
    expect(effectSettings(data.effects![0])[0].value).toBe('0.9');
    expect(setEffectSetting(data, 'effects/ripple', strength, 'lots')).toBe(
      data,
    );
    expect(removeEffect(data, 'effects/ripple').effects).toBeUndefined();
  });

  it('is a row of the view while it is on, and kept through a fold while it is off', () => {
    let data = addEffect(PLAYER, 'effects/ripple', RIPPLE);
    const rows = (view: ActorData) =>
      JSON.stringify(actorView(view)).includes('world_add_effect');
    expect(rows(data)).toBe(true);
    // The view folds back to the same effect, settings and all.
    expect(
      JSON.parse(asActorData(JSON.stringify(actorView(data)))).effects,
    ).toEqual(data.effects);

    data = switchEffect(data, 'effects/ripple', false);
    expect(rows(data)).toBe(false);
    const contents = JSON.stringify(data);
    // A change made through the view keeps it.
    const renamed = throughView(contents, view =>
      view.replace('"Player"', '"Hero"'),
    );
    expect(JSON.parse(renamed)).toMatchObject({
      name: 'Hero',
      effects: [{effect: 'effects/ripple', on: false}],
    });
  });
});

describe('a vector of its own', () => {
  it('starts at an x and a y, kept in two halves', () => {
    const added = addProperty(PLAYER, 'aim', 'vector');
    const set = setPropertyDefault(added, 'aim', '2,3');
    expect(set.properties![0]).toMatchObject({value: '2', valueY: '3'});
    expect(setPropertyDefault(set, 'aim', 'nowhere')).toBe(set);
  });
});

describe('its animations', () => {
  const play = (name: string) => ({
    type: 'world_play_animation',
    fields: {ANIMATION: name},
  });
  const BOBBER: ActorData = {
    ...PLAYER,
    animations: {
      Hop: {tracks: {}},
      Main: {loop: true, tracks: {sprite: [{at: 0, value: 'p.png'}]}},
    },
    blocks: {
      blocks: {
        languageVersion: 0,
        blocks: [
          {type: 'world_on_Input_KeyDownEvent', next: {block: play('Hop')}},
        ],
      },
    },
  };

  it('are listed Main first', () => {
    expect(animationNames(BOBBER)).toEqual(['Main', 'Hop']);
  });

  it('are added doing nothing, and not looping', () => {
    expect(addAnimation(PLAYER, ' Wave ').animations).toEqual({
      Wave: {tracks: {}},
    });
  });

  it('are renamed in place, and the actor’s own code follows', () => {
    const renamed = renameAnimation(BOBBER, 'Hop', 'Jump');
    expect(Object.keys(renamed.animations!)).toEqual(['Jump', 'Main']);
    expect(JSON.stringify(renamed.blocks)).toContain('"ANIMATION":"Jump"');
    expect(JSON.stringify(renamed.blocks)).not.toContain('"Hop"');
    expect(renameAnimation(BOBBER, 'Nope', 'Jump')).toBe(BOBBER);
  });

  it('are deleted, and the key with the last of them', () => {
    expect(Object.keys(removeAnimation(BOBBER, 'Hop').animations!)).toEqual([
      'Main',
    ]);
    const none = removeAnimation(removeAnimation(BOBBER, 'Hop'), 'Main');
    expect(none.animations).toBeUndefined();
  });

  it('loop, or do not, which is said only when they do', () => {
    expect(setAnimationLoop(BOBBER, 'Hop', true).animations!.Hop.loop).toBe(
      true,
    );
    expect(
      setAnimationLoop(BOBBER, 'Main', false).animations!.Main,
    ).not.toHaveProperty('loop');
    expect(setAnimationLoop(BOBBER, 'Main', true)).toBe(BOBBER);
  });

  it('are keyed at a time, and the key moved and taken away', () => {
    const keyed = setAnimationKey(BOBBER, 'Hop', 'drawnScale', 0.5, 2);
    expect(keyed.animations!.Hop.tracks.drawnScale).toEqual([
      {at: 0.5, value: 2},
    ]);
    // Set again where it is, it is the same key with another value.
    const again = setAnimationKey(keyed, 'Hop', 'drawnScale', 0.5, 3);
    expect(again.animations!.Hop.tracks.drawnScale).toEqual([
      {at: 0.5, value: 3},
    ]);
    const moved = moveAnimationKey(again, 'Hop', 'drawnScale', 0.5, 1.2);
    expect(moved.animations!.Hop.tracks.drawnScale).toEqual([
      {at: 1.2, value: 3},
    ]);
    const gone = removeAnimationKey(moved, 'Hop', 'drawnScale', 1.2);
    expect(gone.animations!.Hop.tracks).toEqual({});
    // Main is untouched throughout.
    expect(gone.animations!.Main).toBe(BOBBER.animations!.Main);
  });

  it('take a sheet’s cells as frames from a time, and owe the last its frame', () => {
    const cell = (x: number) => ({x, y: 0, width: 16, height: 16});
    const laid = addAnimationFrames(
      BOBBER,
      'Hop',
      'coin.png',
      [cell(0), cell(16)],
      0.5,
      4,
    );
    expect(laid.animations!.Hop.tracks.sprite).toEqual([
      {at: 0.5, value: {sprite: 'coin.png', cell: cell(0)}},
      {at: 0.75, value: {sprite: 'coin.png', cell: cell(16)}},
      {at: 1, value: {sprite: 'coin.png', cell: cell(16)}},
    ]);
    // Laid again over them, the picture keys in that span are replaced; the
    // one before it stays.
    const main = addAnimationFrames(
      BOBBER,
      'Main',
      'coin.png',
      [cell(32)],
      0,
      2,
    );
    expect(main.animations!.Main.tracks.sprite).toEqual([
      {at: 0, value: {sprite: 'coin.png', cell: cell(32)}},
      {at: 0.5, value: {sprite: 'coin.png', cell: cell(32)}},
    ]);
    const later = addAnimationFrames(
      BOBBER,
      'Main',
      'coin.png',
      [cell(0)],
      1,
      2,
    );
    expect(later.animations!.Main.tracks.sprite).toHaveLength(3);
    expect(addAnimationFrames(BOBBER, 'Hop', 'coin.png', [], 0, 4)).toBe(
      BOBBER,
    );
  });

  it('are drawn as long as asked, but never shorter than their last key', () => {
    const keyed = setAnimationKey(BOBBER, 'Hop', 'opacity', 2, 0);
    expect(setAnimationLength(keyed, 'Hop', 4).animations!.Hop.length).toBe(4);
    expect(setAnimationLength(keyed, 'Hop', 1).animations!.Hop.length).toBe(2);
  });
});

describe('what kind it is', () => {
  it('acts like another actor, or like nothing', () => {
    expect(setActsLike(PLAYER, 'actors/label').actsLike).toBe('actors/label');
    expect(
      setActsLike(setActsLike(PLAYER, 'actors/label'), undefined),
    ).not.toHaveProperty('actsLike');
  });

  it('is a record, or is not, which is said only when it is', () => {
    expect(setIsRecord(PLAYER, true).isData).toBe(true);
    expect(setIsRecord(setIsRecord(PLAYER, true), false)).not.toHaveProperty(
      'isData',
    );
  });

  it('is shown by an icon, or by nothing', () => {
    expect(setIcon(PLAYER, 'button').icon).toBe('button');
    expect(setIcon(setIcon(PLAYER, 'button'), undefined)).not.toHaveProperty(
      'icon',
    );
  });
});
