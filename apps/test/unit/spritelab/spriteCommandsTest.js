/* global p5 */
import {expect} from '../../util/reconfiguredChai';
import {commands} from '@cdo/apps/p5lab/spritelab/commands/spriteCommands';
import * as coreLibrary from '@cdo/apps/p5lab/spritelab/coreLibrary';
import createGameLabP5 from '../../util/gamelab/TestableGameLabP5';

describe('Sprite Commands', () => {
  let gameLabP5, createSprite, animation;
  beforeEach(function() {
    gameLabP5 = createGameLabP5();
    createSprite = gameLabP5.p5.createSprite.bind(gameLabP5.p5);
    let image = new p5.Image(100, 100, gameLabP5.p5);
    let frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
    let sheet = new gameLabP5.p5.SpriteSheet(image, frames);
    animation = new gameLabP5.p5.Animation(sheet);
    coreLibrary.reset();
  });

  it('countByAnimation', () => {
    let sprite1 = createSprite();
    let sprite2 = createSprite();
    let sprite3 = createSprite();
    sprite1.addAnimation('a', animation);
    sprite2.addAnimation('b', animation);
    sprite3.addAnimation('a', animation);
    coreLibrary.addSprite(sprite1);
    coreLibrary.addSprite(sprite2);
    coreLibrary.addSprite(sprite3);

    expect(commands.countByAnimation('a')).to.equal(2);
    expect(commands.countByAnimation('b')).to.equal(1);
    expect(commands.countByAnimation('c')).to.equal(0);
  });

  it('destroy single sprite', () => {
    let sprite1 = createSprite();
    let sprite2 = createSprite();
    let id1 = coreLibrary.addSprite(sprite1);
    let id2 = coreLibrary.addSprite(sprite2);
    expect(coreLibrary.getSpriteIdsInUse()).to.have.members([id1, id2]);

    commands.destroy(id1);
    expect(coreLibrary.getSpriteIdsInUse()).to.have.members([id2]);

    commands.destroy(id2);
    expect(coreLibrary.getSpriteIdsInUse()).to.have.members([]);
  });

  it('destroy animation group', () => {
    let sprite1 = createSprite();
    let sprite2 = createSprite();
    let sprite3 = createSprite();
    sprite1.addAnimation('a', animation);
    sprite2.addAnimation('b', animation);
    sprite3.addAnimation('a', animation);
    coreLibrary.addSprite(sprite1);
    let id2 = coreLibrary.addSprite(sprite2);
    coreLibrary.addSprite(sprite3);

    commands.destroy('a');

    expect(coreLibrary.getSpriteIdsInUse()).to.have.members([id2]);
  });

  it('getProp for single sprite', () => {
    let sprite = createSprite();
    sprite.position.x = 123;
    sprite.position.y = 321;
    sprite.addAnimation('label', animation);
    sprite.anotherProp = 'value';
    let id = coreLibrary.addSprite(sprite);
    expect(commands.getProp(id, 'x')).to.equal(123);
    expect(commands.getProp(id, 'y')).to.equal(400 - 321);
    expect(commands.getProp(id, 'costume')).to.equal('label');
    expect(commands.getProp(id, 'anotherProp')).to.equal('value');
  });

  it('getProp for animation group uses the first sprite in the group', () => {
    let sprite1 = createSprite();
    sprite1.addAnimation('label', animation);
    sprite1.position.x = 123;
    coreLibrary.addSprite(sprite1);

    let sprite2 = createSprite();
    sprite2.addAnimation('label', animation);
    sprite2.position.x = 321;
    coreLibrary.addSprite(sprite2);

    expect(commands.getProp('label', 'x')).to.equal(123);
  });

  describe('makeSprite', () => {
    let makeSprite;
    beforeEach(function() {
      makeSprite = commands.makeSprite.bind(gameLabP5.p5);
    });

    it('returns an id', () => {
      expect(makeSprite()).to.equal(0);
      expect(makeSprite()).to.equal(1);
      expect(makeSprite()).to.equal(2);
    });

    it('location defaults to (200,200)', () => {
      let id = makeSprite();
      expect(commands.getProp(id, 'x')).to.equal(200);
      expect(commands.getProp(id, 'y')).to.equal(200);
    });

    it('location picker works', () => {
      let id = makeSprite(undefined, {x: 123, y: 321});
      expect(commands.getProp(id, 'x')).to.equal(123);
      expect(commands.getProp(id, 'y')).to.equal(400 - 321);
    });

    it('location function works', () => {
      let locationFunc = () => ({x: 123, y: 321});
      let id = makeSprite(undefined, locationFunc);
      expect(commands.getProp(id, 'x')).to.equal(123);
      expect(commands.getProp(id, 'y')).to.equal(400 - 321);
    });

    it('setting animation works', () => {
      gameLabP5.p5._predefinedSpriteAnimations = {costume_label: animation};
      let id = makeSprite('costume_label');
      expect(commands.getProp(id, 'costume')).to.equal('costume_label');
    });
  });

  it('setAnimation for single sprite', () => {
    gameLabP5.p5._predefinedSpriteAnimations = {costume_label: animation};
    let sprite = createSprite();
    let id = coreLibrary.addSprite(sprite);
    commands.setAnimation(id, 'costume_label');
    expect(commands.getProp(id, 'costume')).to.equal('costume_label');
  });

  it('setAnimation for animation group', () => {
    gameLabP5.p5._predefinedSpriteAnimations = {costume_label: animation};
    let sprite1 = createSprite();
    sprite1.addAnimation('a', animation);
    let sprite2 = createSprite();
    sprite2.addAnimation('a', animation);
    let sprite3 = createSprite();
    sprite3.addAnimation('a', animation);

    coreLibrary.addSprite(sprite1);
    coreLibrary.addSprite(sprite2);
    coreLibrary.addSprite(sprite3);

    commands.setAnimation('a', 'costume_label');

    expect(sprite1.getAnimationLabel()).to.equal('costume_label');
    expect(sprite2.getAnimationLabel()).to.equal('costume_label');
    expect(sprite3.getAnimationLabel()).to.equal('costume_label');
  });
});
