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
    const looking = setLook(PLAYER, {sprite: 'player.png'});
    expect(looking.look).toEqual({sprite: 'player.png'});
    expect(setLook(looking, undefined).look).toBeUndefined();
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
