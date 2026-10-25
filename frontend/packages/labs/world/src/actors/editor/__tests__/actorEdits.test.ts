// What the Actor Editor's panel changes (specs/ACTOR_EDITOR_PLAN.md, step 4).

import {describe, expect, it} from 'vitest';

import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {projectFiles} from '../../../runtime/projectFiles';
import type {ActorData} from '../../actorData';
import {
  actorTraitChoices,
  addProperty,
  addTrait,
  literalOf,
  removeTrait,
  setLook,
  setPropertyDefault,
  setValue,
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
