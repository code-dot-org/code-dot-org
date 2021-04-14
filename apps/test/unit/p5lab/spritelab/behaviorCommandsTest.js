/* global p5 */
import {expect} from '../../../util/reconfiguredChai';
import * as coreLibrary from '@cdo/apps/p5lab/spritelab/coreLibrary';
import {commands as actionCommands} from '@cdo/apps/p5lab/spritelab/commands/actionCommands';
import {commands as behaviorCommands} from '@cdo/apps/p5lab/spritelab/commands/behaviorCommands';
import {commands as spriteCommands} from '@cdo/apps/p5lab/spritelab/commands/spriteCommands';
import createP5Wrapper from '../../../util/gamelab/TestableP5Wrapper';

describe('Behavior Commands', () => {
  let p5Wrapper, makeSprite, animation;
  beforeEach(() => {
    p5Wrapper = createP5Wrapper();
    makeSprite = spriteCommands.makeSprite.bind(p5Wrapper.p5);
    let image = new p5.Image(100, 100, p5Wrapper.p5);
    let frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
    let sheet = new p5Wrapper.p5.SpriteSheet(image, frames);
    animation = new p5Wrapper.p5.Animation(sheet);
    coreLibrary.reset();
  });

  describe('followingTargetsFunc', () => {
    it('moves towards the closest target', () => {
      p5Wrapper.p5._predefinedSpriteAnimations = {target: animation};
      makeSprite({name: 'subject', location: {x: 200, y: 200}});
      makeSprite({animation: 'target', location: {x: 125, y: 200}});
      makeSprite({animation: 'target', location: {x: 125, y: 125}});

      actionCommands.addTarget({name: 'subject'}, 'target', 'follow');

      behaviorCommands.followingTargetsFunc(p5Wrapper.p5)({
        name: 'subject'
      });
      expect(spriteCommands.getProp({name: 'subject'}, 'x')).to.equal(195);
      expect(spriteCommands.getProp({name: 'subject'}, 'y')).to.equal(200);
    });

    it('does not move if there are no targets', () => {
      makeSprite({name: 'subject', location: {x: 200, y: 200}});
      behaviorCommands.followingTargetsFunc(p5Wrapper.p5)({
        name: 'subject'
      });

      expect(spriteCommands.getProp({name: 'subject'}, 'x')).to.equal(200);
      expect(spriteCommands.getProp({name: 'subject'}, 'y')).to.equal(200);
    });
  });

  describe('avoidingTargetsFunc', () => {
    it('moves away from the average position of targets in range', () => {
      p5Wrapper.p5._predefinedSpriteAnimations = {target: animation};
      makeSprite({name: 'subject', location: {x: 200, y: 200}});
      makeSprite({animation: 'target', location: {x: 150, y: 250}});
      makeSprite({animation: 'target', location: {x: 150, y: 150}});

      actionCommands.addTarget({name: 'subject'}, 'target', 'avoid');

      behaviorCommands.avoidingTargetsFunc(p5Wrapper.p5)({
        name: 'subject'
      });
      expect(spriteCommands.getProp({name: 'subject'}, 'x')).to.equal(205);
      expect(spriteCommands.getProp({name: 'subject'}, 'y')).to.equal(200);
    });

    it('does not move if there are no targets', () => {
      makeSprite({name: 'subject', location: {x: 200, y: 200}});
      behaviorCommands.avoidingTargetsFunc(p5Wrapper.p5)({
        name: 'subject'
      });

      expect(spriteCommands.getProp({name: 'subject'}, 'x')).to.equal(200);
      expect(spriteCommands.getProp({name: 'subject'}, 'y')).to.equal(200);
    });

    it('does not move if there are no targets in range', () => {
      p5Wrapper.p5._predefinedSpriteAnimations = {target: animation};
      makeSprite({name: 'subject', location: {x: 200, y: 200}});
      makeSprite({animation: 'target', location: {x: 100, y: 100}});

      actionCommands.addTarget({name: 'subject'}, 'target', 'avoid');

      behaviorCommands.avoidingTargetsFunc(p5Wrapper.p5)({
        name: 'subject'
      });
      expect(spriteCommands.getProp({name: 'subject'}, 'x')).to.equal(200);
      expect(spriteCommands.getProp({name: 'subject'}, 'y')).to.equal(200);
    });
  });
});
