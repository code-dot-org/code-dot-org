import {beforeEach, describe, expect, it} from 'vitest';

import {commands as actionCommands} from '../commands/actionCommands';
import {commands} from '../commands/spriteCommands';
import {MAX_NUM_SPRITES} from '../constants';
import type CoreLibrary from '../CoreLibrary';

import {makeLibrary, predefine} from './harness';

describe('Sprite Commands', () => {
  let coreLibrary: CoreLibrary;
  const sprite1Name = 'sprite1';
  const sprite2Name = 'sprite2';
  const sprite3Name = 'sprite3';

  beforeEach(async () => {
    coreLibrary = await makeLibrary();
    predefine(coreLibrary, ['a', 'b', 'label', 'costume_label']);
  });

  it('countByAnimation', () => {
    coreLibrary.addSprite({name: sprite1Name, animation: 'a'});
    coreLibrary.addSprite({name: sprite2Name, animation: 'b'});
    coreLibrary.addSprite({name: sprite3Name, animation: 'a'});

    const count = (spriteArg: {costume?: string; name?: string}) =>
      commands.countByAnimation.apply(coreLibrary, [spriteArg]);
    expect(count({costume: 'a'})).toBe(2);
    expect(count({costume: 'b'})).toBe(1);
    expect(count({costume: 'c'})).toBe(0);
    expect(count({name: sprite1Name})).toBe(1);
  });

  it('destroy single sprite', () => {
    coreLibrary.addSprite({name: sprite1Name});
    coreLibrary.addSprite({name: sprite2Name});

    expect(coreLibrary.getSpriteIdsInUse()).toEqual([0, 1]);

    commands.destroy.apply(coreLibrary, [{name: sprite1Name}]);
    expect(coreLibrary.getSpriteIdsInUse()).toEqual([1]);

    commands.destroy.apply(coreLibrary, [{name: sprite2Name}]);
    expect(coreLibrary.getSpriteIdsInUse()).toEqual([]);
  });

  it('destroy animation group', () => {
    coreLibrary.addSprite({name: sprite1Name, animation: 'a'});
    coreLibrary.addSprite({name: sprite2Name, animation: 'b'});
    coreLibrary.addSprite({name: sprite3Name, animation: 'a'});

    commands.destroy.apply(coreLibrary, [{costume: 'a'}]);

    expect(coreLibrary.getSpriteIdsInUse()).toEqual([1]);
  });

  it('getProp for single sprite', () => {
    coreLibrary.addSprite({
      name: sprite1Name,
      animation: 'label',
      location: {x: 123, y: 321},
    });
    actionCommands.setProp.apply(coreLibrary, [
      {name: sprite1Name},
      'anotherProp',
      'value',
    ]);

    const prop = (name: string) =>
      commands.getProp.apply(coreLibrary, [{name: sprite1Name}, name]);
    expect(prop('x')).toBe(123);
    expect(prop('y')).toBe(400 - 321);
    expect(prop('costume')).toBe('label');
    expect(prop('anotherProp')).toBe('value');
  });

  it('getProp for animation group uses the first sprite in the group', () => {
    coreLibrary.addSprite({
      name: sprite1Name,
      animation: 'label',
      location: {x: 123, y: 321},
    });
    coreLibrary.addSprite({
      name: sprite2Name,
      animation: 'label',
      location: {x: 321, y: 123},
    });

    expect(commands.getProp.apply(coreLibrary, [{costume: 'label'}, 'x'])).toBe(
      123,
    );
  });

  it('setAnimation for single sprite', () => {
    coreLibrary.addSprite({name: sprite1Name});
    commands.setAnimation.apply(coreLibrary, [
      {name: sprite1Name},
      'costume_label',
    ]);
    expect(
      commands.getProp.apply(coreLibrary, [{name: sprite1Name}, 'costume']),
    ).toBe('costume_label');
  });

  it('setAnimation for animation group', () => {
    coreLibrary.addSprite({name: sprite1Name, animation: 'a'});
    coreLibrary.addSprite({name: sprite2Name, animation: 'a'});
    coreLibrary.addSprite({name: sprite3Name, animation: 'a'});

    commands.setAnimation.apply(coreLibrary, [{costume: 'a'}, 'costume_label']);

    expect(coreLibrary.getAnimationsInUse()).toEqual(['costume_label']);
  });

  describe('makeNumSprites', () => {
    const costumed = () =>
      coreLibrary.getSpriteArray({costume: 'costume_label'}).length;

    it('creates multiple sprites with the same costume', () => {
      commands.makeNumSprites.apply(coreLibrary, [10, 'costume_label']);
      expect(costumed()).toBe(10);
    });

    it(`caps at ${MAX_NUM_SPRITES} sprites - makeNumSprites called once`, () => {
      commands.makeNumSprites.apply(coreLibrary, [100000000, 'costume_label']);
      expect(costumed()).toBe(MAX_NUM_SPRITES);
    });

    it(`caps at ${MAX_NUM_SPRITES} sprites - makeNumSprites called multiple times`, () => {
      for (let i = 0; i < 5; i++) {
        commands.makeNumSprites.apply(coreLibrary, [500, 'costume_label']);
      }
      expect(costumed()).toBe(MAX_NUM_SPRITES);
    });
  });

  describe('makeBurst', () => {
    it(`caps at ${MAX_NUM_SPRITES} sprites - makeBurst called once`, () => {
      commands.makeBurst.apply(coreLibrary, [
        100000000,
        'costume_label',
        'burst',
      ]);
      expect(coreLibrary.getNumberOfSprites()).toBe(MAX_NUM_SPRITES);
    });

    it(`caps at ${MAX_NUM_SPRITES} sprites - makeBurst called multiple times`, () => {
      for (let i = 0; i < 5; i++) {
        commands.makeBurst.apply(coreLibrary, [500, 'costume_label', 'burst']);
      }
      expect(coreLibrary.getNumberOfSprites()).toBe(MAX_NUM_SPRITES);
    });
  });
});
