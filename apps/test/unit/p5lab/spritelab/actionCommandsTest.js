import {commands} from '@cdo/apps/p5lab/spritelab/commands/actionCommands';
import {commands as spriteCommands} from '@cdo/apps/p5lab/spritelab/commands/spriteCommands';
import CoreLibrary from '@cdo/apps/p5lab/spritelab/CoreLibrary';

import createP5Wrapper from '../../../util/gamelab/TestableP5Wrapper';


describe('Action Commands', () => {
  let coreLibrary;
  const spriteName = 'spriteName';

  beforeEach(function () {
    const p5Wrapper = createP5Wrapper();
    coreLibrary = new CoreLibrary(p5Wrapper.p5);
  });

  describe('addTarget', () => {
    it('adds targets to follow', () => {
      coreLibrary.addSprite({name: spriteName});
      const sprite = coreLibrary.getSpriteArray({name: spriteName})[0];
      expect(sprite.targetSet).toBeUndefined();
      commands.addTarget.apply(coreLibrary, [
        {name: spriteName},
        'costume1',
        'follow',
      ]);
      expect(sprite.targetSet).toEqual({follow: ['costume1'], avoid: []});
      commands.addTarget.apply(coreLibrary, [
        {name: spriteName},
        'costume2',
        'follow',
      ]);
      expect(sprite.targetSet).toEqual({
        follow: ['costume1', 'costume2'],
        avoid: [],
      });
    });

    it('adds targets to avoid', () => {
      coreLibrary.addSprite({name: spriteName});
      const sprite = coreLibrary.getSpriteArray({name: spriteName})[0];
      expect(sprite.targetSet).toBeUndefined();
      commands.addTarget.apply(coreLibrary, [
        {name: spriteName},
        'costume1',
        'avoid',
      ]);
      expect(sprite.targetSet).toEqual({follow: [], avoid: ['costume1']});
      commands.addTarget.apply(coreLibrary, [
        {name: spriteName},
        'costume2',
        'avoid',
      ]);
      expect(sprite.targetSet).toEqual({
        follow: [],
        avoid: ['costume1', 'costume2'],
      });
    });

    it('can follow and avoid at the same time', () => {
      coreLibrary.addSprite({name: spriteName});
      const sprite = coreLibrary.getSpriteArray({name: spriteName})[0];
      expect(sprite.targetSet).toBeUndefined();
      commands.addTarget.apply(coreLibrary, [
        {name: spriteName},
        'costume1',
        'follow',
      ]);
      commands.addTarget.apply(coreLibrary, [
        {name: spriteName},
        'costume2',
        'avoid',
      ]);
      expect(sprite.targetSet).toEqual({
        follow: ['costume1'],
        avoid: ['costume2'],
      });
    });

    it('console.warn on unknown target types', () => {
      jest.spyOn(console, 'warn').mockClear().mockImplementation();
      coreLibrary.addSprite({name: spriteName});
      const sprite = coreLibrary.getSpriteArray({name: spriteName})[0];
      expect(sprite.targetSet).toBeUndefined();
      commands.addTarget.apply(coreLibrary, [
        {name: spriteName},
        'costume1',
        'other',
      ]);
      expect(console.warn).to.have.been.calledOnceWith(
        'unkknown targetType: other'
      );
      expect(sprite.targetSet).toBeUndefined();
      console.warn.mockRestore();
    });
  });

  describe('bounceOff', () => {
    it('changes direction if sprites are touching', () => {
      coreLibrary.addSprite({name: 'spriteName1', location: {x: 200, y: 200}});
      commands.changePropBy.apply(coreLibrary, [
        {name: 'spriteName1'},
        'direction',
        180,
      ]);
      commands.setProp.apply(coreLibrary, [{name: 'spriteName1'}, 'speed', 10]);
      coreLibrary.addSprite({name: 'spriteName2', location: {x: 200, y: 200}});
      commands.bounceOff.apply(coreLibrary, [
        {name: 'spriteName1'},
        {name: 'spriteName2'},
      ]);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [
          {name: 'spriteName1'},
          'direction',
        ])
      ).toBe(0);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: 'spriteName1'}, 'x'])
      ).toBe(189);
    });

    it('does not change direction if sprites are not touching', () => {
      coreLibrary.addSprite({name: 'spriteName1', location: {x: 0, y: 0}});
      commands.changePropBy.apply(coreLibrary, [
        {name: 'spriteName1'},
        'direction',
        180,
      ]);
      coreLibrary.addSprite({name: 'spriteName2', location: {x: 400, y: 400}});
      commands.bounceOff.apply(coreLibrary, [
        {name: 'spriteName1'},
        {name: 'spriteName2'},
      ]);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [
          {name: 'spriteName1'},
          'direction',
        ])
      ).toBe(180);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: 'spriteName1'}, 'x'])
      ).toBe(0);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [
          {name: 'spriteName2'},
          'direction',
        ])
      ).toBe(0);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: 'spriteName2'}, 'x'])
      ).toBe(400);
    });
  });

  it('changePropBy', () => {
    coreLibrary.addSprite({name: spriteName, location: {x: 123, y: 321}});
    commands.changePropBy.apply(coreLibrary, [{name: spriteName}, 'x', 100]);
    expect(
      spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'x'])
    ).toBe(223);

    commands.changePropBy.apply(coreLibrary, [{name: spriteName}, 'y', 100]);
    expect(
      spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'y'])
    ).toBe(400 - 221);

    expect(
      spriteCommands.getProp.apply(coreLibrary, [
        {name: spriteName},
        'direction',
      ])
    ).toBe(0);
    commands.changePropBy.apply(coreLibrary, [
      {name: spriteName},
      'direction',
      200,
    ]);
    expect(
      spriteCommands.getProp.apply(coreLibrary, [
        {name: spriteName},
        'direction',
      ])
    ).toBe(200);
    commands.changePropBy.apply(coreLibrary, [
      {name: spriteName},
      'direction',
      200,
    ]);
    expect(
      spriteCommands.getProp.apply(coreLibrary, [
        {name: spriteName},
        'direction',
      ])
    ).toBe(40);
  });

  it('isTouchingSprite', () => {
    coreLibrary.addSprite({name: 'spriteName1', location: {x: 0, y: 0}});
    coreLibrary.addSprite({name: 'spriteName2', location: {x: 200, y: 200}});
    coreLibrary.addSprite({name: 'spriteName3', location: {x: 200, y: 200}});

    expect(
      commands.isTouchingSprite.apply(coreLibrary, [
        {name: 'spriteName1'},
        {name: 'spriteName2'},
      ])
    ).toBe(false);
    expect(
      commands.isTouchingSprite.apply(coreLibrary, [
        {name: 'spriteName3'},
        {name: 'spriteName2'},
      ])
    ).toBe(true);
  });

  it('jumpTo', () => {
    coreLibrary.addSprite({name: spriteName, location: {x: 123, y: 321}});
    commands.jumpTo.apply(coreLibrary, [{name: spriteName}, {x: 321, y: 123}]);
    expect(
      spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'x'])
    ).toBe(321);
    expect(
      spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'y'])
    ).toBe(400 - 123);
  });

  describe('moveForward', () => {
    it('can move horizontally', () => {
      coreLibrary.addSprite({name: spriteName, location: {x: 0, y: 0}});
      expect(
        spriteCommands.getProp.apply(coreLibrary, [
          {name: spriteName},
          'direction',
        ])
      ).toBe(0);
      commands.moveForward.apply(coreLibrary, [{name: spriteName}, 100]);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'x'])
      ).toBe(100);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'y'])
      ).toBe(400 - 0);
    });

    it('can move vertically', () => {
      coreLibrary.addSprite({name: spriteName, location: {x: 0, y: 0}});
      commands.setProp.apply(coreLibrary, [
        {name: spriteName},
        'direction',
        90,
      ]);
      commands.moveForward.apply(coreLibrary, [{name: spriteName}, 100]);

      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'x'])
      ).toBeGreaterThanOrEqual(0);

      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'x'])
      ).toBeLessThanOrEqual(0.1);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'y'])
      ).toBe(400 - 100);
    });

    it('can move diagonally', () => {
      coreLibrary.addSprite({name: spriteName, location: {x: 0, y: 0}});
      commands.setProp.apply(coreLibrary, [
        {name: spriteName},
        'direction',
        45,
      ]);
      commands.moveForward.apply(coreLibrary, [{name: spriteName}, 100]);

      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'x'])
      ).toBeGreaterThanOrEqual(70);

      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'x'])
      ).toBeLessThanOrEqual(71);
      let y =
        400 -
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'y']);
      expect(y).toBeGreaterThanOrEqual(70);
      expect(y).toBeLessThanOrEqual(71);
    });
  });

  it('moveInDirection', () => {
    coreLibrary.addSprite({name: spriteName, location: {x: 0, y: 0}});
    commands.moveInDirection.apply(coreLibrary, [
      {name: spriteName},
      50,
      'South',
    ]);
    expect(
      spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'x'])
    ).toBe(0);
    expect(
      spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'y'])
    ).toBe(400 - 50);

    commands.moveInDirection.apply(coreLibrary, [
      {name: spriteName},
      50,
      'West',
    ]);
    expect(
      spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'x'])
    ).toBe(-50);
    expect(
      spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'y'])
    ).toBe(400 - 50);

    commands.moveInDirection.apply(coreLibrary, [
      {name: spriteName},
      50,
      'North',
    ]);
    expect(
      spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'x'])
    ).toBe(-50);
    expect(
      spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'y'])
    ).toBe(400);

    commands.moveInDirection.apply(coreLibrary, [
      {name: spriteName},
      50,
      'East',
    ]);
    expect(
      spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'x'])
    ).toBe(0);
    expect(
      spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'y'])
    ).toBe(400);
  });

  describe('moveToward', () => {
    it('moves the sprite towards the target', () => {
      coreLibrary.addSprite({name: spriteName, location: {x: 0, y: 50}});

      commands.moveToward.apply(coreLibrary, [
        {name: spriteName},
        100,
        {x: 123, y: 321},
      ]);

      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'x'])
      ).toBeGreaterThanOrEqual(41.3);

      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'x'])
      ).toBeLessThanOrEqual(41.4);
      let expectedY = 400 - (50 + 91.1);

      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'y'])
      ).toBeGreaterThanOrEqual(expectedY);

      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'y'])
      ).toBeLessThanOrEqual(expectedY + 0.1);
    });

    it('does not overshoot the target', () => {
      coreLibrary.addSprite({name: spriteName, location: {x: 100, y: 100}});
      const target = {x: 110, y: 120};
      commands.moveToward.apply(coreLibrary, [{name: spriteName}, 100, target]);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'x'])
      ).toBe(110);
      const expectedY = 400 - target.y;
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'y'])
      ).toBe(expectedY);
    });
  });

  describe('setProp', () => {
    beforeEach(function () {
      coreLibrary.addSprite({name: spriteName, location: {x: 0, y: 0}});
    });
    it('sets direction', () => {
      commands.setProp.apply(coreLibrary, [
        {name: spriteName},
        'direction',
        100,
      ]);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [
          {name: spriteName},
          'direction',
        ])
      ).toBe(100);
      commands.setProp.apply(coreLibrary, [
        {name: spriteName},
        'direction',
        400,
      ]);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [
          {name: spriteName},
          'direction',
        ])
      ).toBe(40);
    });

    it('sets arbitrary properties', () => {
      commands.setProp.apply(coreLibrary, [
        {name: spriteName},
        'someProp',
        100,
      ]);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [
          {name: spriteName},
          'someProp',
        ])
      ).toBe(100);
    });

    it('sets scale, height, and width', () => {
      let image = new p5.Image(100, 100, coreLibrary.p5);
      let frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
      let sheet = new coreLibrary.p5.SpriteSheet(image, frames);
      let animation = new coreLibrary.p5.Animation(sheet);
      coreLibrary.p5._predefinedSpriteAnimations = {costume_label: animation};
      coreLibrary.addSprite({name: spriteName, animation: 'costume_label'});
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'scale'])
      ).toBe(100);
      commands.setProp.apply(coreLibrary, [{name: spriteName}, 'scale', 50]);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'scale'])
      ).toBe(50);

      commands.setProp.apply(coreLibrary, [{name: spriteName}, 'height', 500]);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [
          {name: spriteName},
          'height',
        ])
      ).toBe(250);

      commands.setProp.apply(coreLibrary, [{name: spriteName}, 'width', 500]);
      expect(
        spriteCommands.getProp.apply(coreLibrary, [{name: spriteName}, 'width'])
      ).toBe(250);
    });
  });

  it('turn', () => {
    coreLibrary.addSprite({name: spriteName});
    commands.turn.apply(coreLibrary, [{name: spriteName}, 90, 'right']);
    expect(
      spriteCommands.getProp.apply(coreLibrary, [
        {name: spriteName},
        'rotation',
      ])
    ).toBe(90);

    commands.turn.apply(coreLibrary, [{name: spriteName}, 180, 'left']);
    expect(
      spriteCommands.getProp.apply(coreLibrary, [
        {name: spriteName},
        'rotation',
      ])
    ).toBe(-90);
  });

  // tests copied from dance party repo here:
  // https://github.com/code-dot-org/dance-party/blob/main/test/unit/layoutTest.js
  describe('layoutSprites', () => {
    const minX = 20;
    const maxX = 400 - minX;
    const minY = 35;
    const maxY = 400 - 40;

    const createSprites = (n, animation) => {
      for (let i = 0; i < n; i++) {
        coreLibrary.addSprite({
          animation: animation,
        });
      }
    };

    beforeEach(() => {
      let image = new p5.Image(100, 100, coreLibrary.p5);
      let frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
      let sheet = new coreLibrary.p5.SpriteSheet(image, frames);
      let animation = new coreLibrary.p5.Animation(sheet);
      coreLibrary.p5._predefinedSpriteAnimations = {
        cat: animation,
        alien: animation,
        duck: animation,
      };
    });

    it('scales sprites in a non-circle layout', () => {
      coreLibrary.addSprite({
        animation: 'cat',
      });

      const spritesBeforeLayout = coreLibrary.getSpriteArray({costume: 'cat'});
      expect(spritesBeforeLayout.length).toBe(1);
      expect(spritesBeforeLayout[0].getScale()).toBe(1);

      commands.layoutSprites.apply(coreLibrary, ['cat', 'border']);

      const spritesAfterLayout = coreLibrary.getSpriteArray({costume: 'cat'});
      expect(spritesAfterLayout.length).toBe(1);
      expect(spritesAfterLayout[0].getScale()).toBe(0.3);
    });

    it('circle layout works with 1 sprite', () => {
      coreLibrary.addSprite({
        animation: 'cat',
      });

      commands.layoutSprites.apply(coreLibrary, ['cat', 'circle']);
      const sprites = coreLibrary.getSpriteArray({costume: 'cat'});

      // one sprite, facing upwards
      expect(sprites.length).toBe(1);
      expect(sprites[0].x).toBe(200);
    });

    it('circle layout works with 2 sprites', () => {
      createSprites(2, 'cat');

      commands.layoutSprites.apply(coreLibrary, ['cat', 'circle']);
      const sprites = coreLibrary.getSpriteArray({costume: 'cat'});

      expect(sprites.length).toBe(2);
      expect(sprites[0].x).toBe(200);

      expect(sprites[1].x).toBe(200);

      // fairly weak test that they just have different y values
      expect(sprites[0].y).not.toBe(sprites[1].y);
    });

    it('circle changes radius/scale as we add more sprites', () => {
      createSprites(2, 'cat');
      createSprites(10, 'alien');
      createSprites(20, 'duck');

      commands.layoutSprites.apply(coreLibrary, ['cat', 'circle']);
      const cats = coreLibrary.getSpriteArray({costume: 'cat'});

      commands.layoutSprites.apply(coreLibrary, ['alien', 'circle']);
      const aliens = coreLibrary.getSpriteArray({costume: 'alien'});

      commands.layoutSprites.apply(coreLibrary, ['duck', 'circle']);
      const ducks = coreLibrary.getSpriteArray({costume: 'duck'});

      // fewer cats, so they should be bigger
      expect(cats[0].scale).toBeGreaterThan(aliens[0].scale);
      expect(cats[0].scale).toBeGreaterThan(ducks[0].scale);

      // we should stop getting bigger after count 10
      expect(aliens[0].scale).toBe(ducks[0].scale);

      // radius should be smaller when we have fewer (so y should be bigger)
      expect(cats[0].y).toBeGreaterThan(aliens[0].y);
      expect(cats[0].y).toBeGreaterThan(ducks[0].y);

      // again, this should be unaffected after count 10
      expect(aliens[0].y).toBe(ducks[0].y);
    });

    it('border works with 5 sprites', () => {
      createSprites(5, 'cat');

      commands.layoutSprites.apply(coreLibrary, ['cat', 'border']);
      const sprites = coreLibrary.getSpriteArray({costume: 'cat'});

      // first four are at the corners
      expect(sprites[0].x).toBe(minX);
      expect(sprites[0].y).toBe(minY);

      expect(sprites[1].x).toBe(maxX);
      expect(sprites[1].y).toBe(minY);

      expect(sprites[2].x).toBe(maxX);
      expect(sprites[2].y).toBe(maxY);

      expect(sprites[3].x).toBe(minX);
      expect(sprites[3].y).toBe(maxY);

      expect(sprites[4].x).toBe((minX + maxX) / 2);
      expect(sprites[4].y).toBe(minY);
    });

    it('border works with > 10 sprites', () => {
      createSprites(11, 'cat');

      commands.layoutSprites.apply(coreLibrary, ['cat', 'border']);
      const sprites = coreLibrary.getSpriteArray({costume: 'cat'});

      expect(sprites.length).toBe(11);

      // top row should contain first, second, and then 2 more
      [0, 1, 4, 5].forEach(i => expect(sprites[i].y).toBe(minY));

      // right column contains second, third, and 2 others
      [1, 2, 6, 7].forEach(i => expect(sprites[i].x).toBe(maxX));

      // bottom row contains third, fourth, and 2 others
      [2, 3, 8, 9].forEach(i => expect(sprites[i].y).toBe(maxY));

      // left column contains fourth, first and 1 other
      [3, 0, 10].forEach(i => expect(sprites[i].x).toBe(minX));
    });

    it('grid layout with perfect square count', () => {
      createSprites(4, 'cat');

      commands.layoutSprites.apply(coreLibrary, ['cat', 'grid']);
      const sprites = coreLibrary.getSpriteArray({costume: 'cat'});

      expect(sprites.length, 4);

      expect(sprites[0].x).toBe(minX);
      expect(sprites[0].y).toBe(minY);

      expect(sprites[1].x).toBe(maxX);
      expect(sprites[1].y).toBe(minY);

      expect(sprites[2].x).toBe(minX);
      expect(sprites[2].y).toBe(maxY);

      expect(sprites[3].x).toBe(maxX);
      expect(sprites[3].y).toBe(maxY);
    });

    it('grid layout without perfect square count', () => {
      createSprites(5, 'cat');

      commands.layoutSprites.apply(coreLibrary, ['cat', 'grid']);
      const sprites = coreLibrary.getSpriteArray({costume: 'cat'});

      expect(sprites.length).toBe(5);

      // size 5 means we're filling up a 3x3 grid, except that we don't end up
      // needing the 3rd row, and so we instead fill a 3x2 grid
      expect(sprites[0].x).toBe(minX);
      expect(sprites[0].y).toBe(minY);

      expect(sprites[1].x).toBe((minX + maxX) / 2);
      expect(sprites[1].y).toBe(minY);

      expect(sprites[2].x).toBe(maxX);
      expect(sprites[2].y).toBe(minY);

      expect(sprites[3].x).toBe(minX);
      expect(sprites[3].y).toBe(maxY);

      expect(sprites[4].x).toBe((minX + maxX) / 2);
      expect(sprites[4].y).toBe(maxY);
    });

    it('grid layout of size 2', () => {
      createSprites(2, 'cat');

      commands.layoutSprites.apply(coreLibrary, ['cat', 'grid']);
      const sprites = coreLibrary.getSpriteArray({costume: 'cat'});

      expect(sprites.length, 2);

      expect(sprites[0].x).toBe(minX);
      expect(sprites[0].y).toBe(minY);

      expect(sprites[1].x).toBe(maxX);
      expect(sprites[1].y).toBe(minY);
    });
  });
});
