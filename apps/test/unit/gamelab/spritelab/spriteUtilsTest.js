/* global p5 */
import {expect} from '../../../util/reconfiguredChai';
import createGameLabP5 from '../../../util/gamelab/TestableGameLabP5';
import * as spriteUtils from '@cdo/apps/gamelab/spritelab/spriteUtils';

describe('Sprite Utils', () => {
  let gameLabP5, createSprite, animation;

  beforeEach(function() {
    gameLabP5 = createGameLabP5();
    createSprite = gameLabP5.p5.createSprite.bind(gameLabP5.p5);
    let image = new p5.Image(100, 100, gameLabP5.p5);
    let frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
    let sheet = new gameLabP5.p5.SpriteSheet(image, frames);
    animation = new gameLabP5.p5.Animation(sheet);
    spriteUtils.reset();
  });

  describe('Sprite Map', () => {
    it('sprite ids increase starting at 0', () => {
      let sprite1 = createSprite();
      let id1 = spriteUtils.addSprite(sprite1);
      expect(id1).to.equal(0);

      let sprite2 = createSprite();
      let id2 = spriteUtils.addSprite(sprite2);
      expect(id2).to.equal(1);

      let sprite3 = createSprite();
      let id3 = spriteUtils.addSprite(sprite3);
      expect(id3).to.equal(2);

      expect(spriteUtils.getSpriteIdsInUse()).to.have.members([0, 1, 2]);
    });

    it('deleting a sprite removes its id', () => {
      let sprite1 = createSprite();
      let id1 = spriteUtils.addSprite(sprite1);
      expect(spriteUtils.getSpriteIdsInUse()).to.have.members([0]);

      spriteUtils.deleteSprite(id1);
      expect(spriteUtils.getSpriteIdsInUse()).to.have.members([]);

      let sprite2 = createSprite();
      spriteUtils.addSprite(sprite2);
      expect(spriteUtils.getSpriteIdsInUse()).to.have.members([1]);
    });

    it('can get all animations in use', () => {
      let sprite1 = createSprite();
      let sprite2 = createSprite();
      let sprite3 = createSprite();
      sprite1.addAnimation('a', animation);
      sprite2.addAnimation('b', animation);
      sprite3.addAnimation('a', animation);
      spriteUtils.addSprite(sprite1);
      spriteUtils.addSprite(sprite2);
      spriteUtils.addSprite(sprite3);

      expect(spriteUtils.getAnimationsInUse()).to.have.members(['a', 'b']);
    });
  });

  describe('getSpriteArray', () => {
    it('works with ids', () => {
      let sprite1 = createSprite();
      let sprite2 = createSprite();
      let sprite3 = createSprite();
      let id1 = spriteUtils.addSprite(sprite1);
      let id2 = spriteUtils.addSprite(sprite2);
      let id3 = spriteUtils.addSprite(sprite3);

      expect(spriteUtils.getSpriteArray(id1)).to.have.members([sprite1]);
      expect(spriteUtils.getSpriteArray(id2)).to.have.members([sprite2]);
      expect(spriteUtils.getSpriteArray(id3)).to.have.members([sprite3]);
    });

    it('works with animation groups', () => {
      let sprite1 = createSprite();
      let sprite2 = createSprite();
      let sprite3 = createSprite();
      sprite1.addAnimation('a', animation);
      sprite2.addAnimation('b', animation);
      sprite3.addAnimation('a', animation);
      spriteUtils.addSprite(sprite1);
      spriteUtils.addSprite(sprite2);
      spriteUtils.addSprite(sprite3);

      expect(spriteUtils.getSpriteArray('a')).to.have.members([
        sprite1,
        sprite3
      ]);
      expect(spriteUtils.getSpriteArray('b')).to.have.members([sprite2]);
    });
  });
});
