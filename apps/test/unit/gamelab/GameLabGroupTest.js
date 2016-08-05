/** @file Tests for GameLabGroup, our extension of p5.play Group */
import {spy} from 'sinon';
import {expect} from '../../util/configuredChai';
import createGameLabP5 from '../../util/gamelab/TestableGameLabP5';

describe('GameLabGroup', function () {
  let gameLabP5, createSprite, createGroup;

  beforeEach(function () {
    gameLabP5 = createGameLabP5();
    createSprite = gameLabP5.p5.createSprite.bind(gameLabP5.p5);
    createGroup = gameLabP5.p5.createGroup.bind(gameLabP5.p5);
  });

  describe('methods applying to each sprite', function () {
    it('setSpeedAndDirectionEach calls setSpeedAndDirection for each member', function () {
      let sprite1 = createSprite(0, 0);
      let sprite2 = createSprite(0, 0);
      let group = createGroup();
      group.add(sprite1);
      group.add(sprite2);
      spy(sprite1, 'setSpeedAndDirection');
      spy(sprite2, 'setSpeedAndDirection');
      expect(sprite1.setSpeedAndDirection.calledOnce).to.be.false;
      expect(sprite2.setSpeedAndDirection.calledOnce).to.be.false;

      const speed = 5;
      const direction = 180;
      group.setSpeedAndDirectionEach(speed, direction);
      expect(sprite1.setSpeedAndDirection.calledOnce).to.be.true;
      expect(sprite2.setSpeedAndDirection.calledOnce).to.be.true;
      expect(sprite1.setSpeedAndDirection.calledWith(speed, direction)).to.be.true;
      expect(sprite2.setSpeedAndDirection.calledWith(speed, direction)).to.be.true;
    });
  });
});
