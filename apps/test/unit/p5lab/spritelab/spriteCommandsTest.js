import {commands as actionCommands} from '@cdo/apps/p5lab/spritelab/commands/actionCommands';
import {commands} from '@cdo/apps/p5lab/spritelab/commands/spriteCommands';
import {MAX_NUM_SPRITES} from '@cdo/apps/p5lab/spritelab/constants';
import CoreLibrary from '@cdo/apps/p5lab/spritelab/CoreLibrary';

import createP5Wrapper from '../../../util/gamelab/TestableP5Wrapper';

describe('Sprite Commands', () => {
  let coreLibrary;
  const sprite1Name = 'sprite1';
  const sprite2Name = 'sprite2';
  const sprite3Name = 'sprite3';
  beforeEach(function () {
    const p5Wrapper = createP5Wrapper();
    coreLibrary = new CoreLibrary(p5Wrapper.p5);
    let image = new p5.Image(100, 100, p5Wrapper.p5);
    let frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
    let sheet = new p5Wrapper.p5.SpriteSheet(image, frames);
    let animation = new p5Wrapper.p5.Animation(sheet);
    coreLibrary.p5._predefinedSpriteAnimations = {
      a: animation,
      b: animation,
      label: animation,
      costume_label: animation,
    };
  });

  it('countByAnimation', () => {
    coreLibrary.addSprite({name: sprite1Name, animation: 'a'});
    coreLibrary.addSprite({name: sprite2Name, animation: 'b'});
    coreLibrary.addSprite({name: sprite3Name, animation: 'a'});

    expect(commands.countByAnimation.apply(coreLibrary, [{costume: 'a'}])).toBe(
      2
    );
    expect(commands.countByAnimation.apply(coreLibrary, [{costume: 'b'}])).toBe(
      1
    );
    expect(commands.countByAnimation.apply(coreLibrary, [{costume: 'c'}])).toBe(
      0
    );

    expect(
      commands.countByAnimation.apply(coreLibrary, [{name: sprite1Name}])
    ).toBe(1);
  });

  it('destroy single sprite', () => {
    coreLibrary.addSprite({name: sprite1Name});
    coreLibrary.addSprite({name: sprite2Name});

    expect(coreLibrary.getSpriteIdsInUse()).toEqual(
      expect.arrayContaining([0, 1])
    );

    commands.destroy.apply(coreLibrary, [{name: sprite1Name}]);
    expect(coreLibrary.getSpriteIdsInUse()).toEqual(
      expect.arrayContaining([1])
    );

    commands.destroy.apply(coreLibrary, [{name: sprite2Name}]);
    expect(coreLibrary.getSpriteIdsInUse()).toEqual(expect.arrayContaining([]));
  });

  it('destroy animation group', () => {
    coreLibrary.addSprite({name: sprite1Name, animation: 'a'});
    coreLibrary.addSprite({name: sprite2Name, animation: 'b'});
    coreLibrary.addSprite({name: sprite3Name, animation: 'a'});

    commands.destroy.apply(coreLibrary, [{costume: 'a'}]);

    expect(coreLibrary.getSpriteIdsInUse()).toEqual(
      expect.arrayContaining([1])
    );
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

    expect(
      commands.getProp.apply(coreLibrary, [{name: sprite1Name}, 'x'])
    ).toBe(123);
    expect(
      commands.getProp.apply(coreLibrary, [{name: sprite1Name}, 'y'])
    ).toBe(400 - 321);
    expect(
      commands.getProp.apply(coreLibrary, [{name: sprite1Name}, 'costume'])
    ).toBe('label');
    expect(
      commands.getProp.apply(coreLibrary, [{name: sprite1Name}, 'anotherProp'])
    ).toBe('value');
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
      123
    );
  });

  it('setAnimation for single sprite', () => {
    coreLibrary.addSprite({name: sprite1Name});
    commands.setAnimation.apply(coreLibrary, [
      {name: sprite1Name},
      'costume_label',
    ]);
    expect(
      commands.getProp.apply(coreLibrary, [{name: sprite1Name}, 'costume'])
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
    it('creates multiple sprites with the same costume', () => {
      commands.makeNumSprites.apply(coreLibrary, [10, 'costume_label']);
      expect(
        coreLibrary.getSpriteArray({costume: 'costume_label'}).length
      ).toBe(10);
    });

    it(`caps at ${MAX_NUM_SPRITES} sprites - makeNumSprites called once`, () => {
      commands.makeNumSprites.apply(coreLibrary, [100000000, 'costume_label']);
      expect(
        coreLibrary.getSpriteArray({costume: 'costume_label'}).length
      ).toBe(MAX_NUM_SPRITES);
    });

    it(`caps at ${MAX_NUM_SPRITES} sprites - makeNumSprites called multiple times`, () => {
      for (let i = 0; i < 5; i++) {
        commands.makeNumSprites.apply(coreLibrary, [500, 'costume_label']);
      }
      expect(
        coreLibrary.getSpriteArray({costume: 'costume_label'}).length
      ).toBe(MAX_NUM_SPRITES);
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
