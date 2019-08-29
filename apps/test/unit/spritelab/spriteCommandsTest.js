/* global p5 */
import {expect} from '../../util/reconfiguredChai';
import {commands} from '@cdo/apps/p5lab/spritelab/spriteCommands';
import * as spriteUtils from '@cdo/apps/p5lab/spritelab/spriteUtils';
import createP5Wrapper from '../../util/gamelab/TestableP5Wrapper';

describe('Sprite Commands', () => {
  let p5Wrapper, createSprite, animation;
  beforeEach(function() {
    p5Wrapper = createP5Wrapper();
    createSprite = p5Wrapper.p5.createSprite.bind(p5Wrapper.p5);
    let image = new p5.Image(100, 100, p5Wrapper.p5);
    let frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
    let sheet = new p5Wrapper.p5.SpriteSheet(image, frames);
    animation = new p5Wrapper.p5.Animation(sheet);
    spriteUtils.reset();
  });

  it('countByAnimation', () => {
    let sprite1 = createSprite();
    let sprite2 = createSprite();
    let sprite3 = createSprite();
    sprite1.addAnimation('a', animation);
    sprite2.addAnimation('b', animation);
    sprite3.addAnimation('a', animation);
    spriteUtils.addSprite(sprite1);
    spriteUtils.addSprite(sprite2);
    spriteUtils.addSprite(sprite3);

    expect(commands.countByAnimation('a')).to.equal(2);
    expect(commands.countByAnimation('b')).to.equal(1);
    expect(commands.countByAnimation('c')).to.equal(0);
  });

  it('destroy single sprite', () => {
    let sprite1 = createSprite();
    let sprite2 = createSprite();
    let id1 = spriteUtils.addSprite(sprite1);
    let id2 = spriteUtils.addSprite(sprite2);
    expect(spriteUtils.getSpriteIdsInUse()).to.have.members([id1, id2]);

    commands.destroy(id1);
    expect(spriteUtils.getSpriteIdsInUse()).to.have.members([id2]);

    commands.destroy(id2);
    expect(spriteUtils.getSpriteIdsInUse()).to.have.members([]);
  });

  it('destroy animation group', () => {
    let sprite1 = createSprite();
    let sprite2 = createSprite();
    let sprite3 = createSprite();
    sprite1.addAnimation('a', animation);
    sprite2.addAnimation('b', animation);
    sprite3.addAnimation('a', animation);
    spriteUtils.addSprite(sprite1);
    let id2 = spriteUtils.addSprite(sprite2);
    spriteUtils.addSprite(sprite3);

    commands.destroy('a');

    expect(spriteUtils.getSpriteIdsInUse()).to.have.members([id2]);
  });

  it('getProp for single sprite', () => {
    let sprite = createSprite();
    sprite.position.x = 123;
    sprite.position.y = 321;
    sprite.addAnimation('label', animation);
    sprite.anotherProp = 'value';
    let id = spriteUtils.addSprite(sprite);
    expect(commands.getProp(id, 'x')).to.equal(123);
    expect(commands.getProp(id, 'y')).to.equal(400 - 321);
    expect(commands.getProp(id, 'costume')).to.equal('label');
    expect(commands.getProp(id, 'anotherProp')).to.equal('value');
  });

  it('getProp for animation group uses the first sprite in the group', () => {
    let sprite1 = createSprite();
    sprite1.addAnimation('label', animation);
    sprite1.position.x = 123;
    spriteUtils.addSprite(sprite1);

    let sprite2 = createSprite();
    sprite2.addAnimation('label', animation);
    sprite2.position.x = 321;
    spriteUtils.addSprite(sprite2);

    expect(commands.getProp('label', 'x')).to.equal(123);
  });

  describe('makeSprite', () => {
    let makeSprite;
    beforeEach(function() {
      makeSprite = commands.makeSprite.bind(p5Wrapper.p5);
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
      p5Wrapper.p5._predefinedSpriteAnimations = {costume_label: animation};
      let id = makeSprite('costume_label');
      expect(commands.getProp(id, 'costume')).to.equal('costume_label');
    });
  });

  it('setAnimation for single sprite', () => {
    p5Wrapper.p5._predefinedSpriteAnimations = {costume_label: animation};
    let sprite = createSprite();
    let id = spriteUtils.addSprite(sprite);
    commands.setAnimation(id, 'costume_label');
    expect(commands.getProp(id, 'costume')).to.equal('costume_label');
  });

  it('setAnimation for animation group', () => {
    p5Wrapper.p5._predefinedSpriteAnimations = {costume_label: animation};
    let sprite1 = createSprite();
    sprite1.addAnimation('a', animation);
    let sprite2 = createSprite();
    sprite2.addAnimation('a', animation);
    let sprite3 = createSprite();
    sprite3.addAnimation('a', animation);

    spriteUtils.addSprite(sprite1);
    spriteUtils.addSprite(sprite2);
    spriteUtils.addSprite(sprite3);

    commands.setAnimation('a', 'costume_label');

    expect(sprite1.getAnimationLabel()).to.equal('costume_label');
    expect(sprite2.getAnimationLabel()).to.equal('costume_label');
    expect(sprite3.getAnimationLabel()).to.equal('costume_label');
  });
});
