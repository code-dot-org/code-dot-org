/* global p5 */
import {expect} from '../../util/reconfiguredChai';
import {commands} from '@cdo/apps/p5lab/spritelab/commands/spriteCommands';
import {commands as actionCommands} from '@cdo/apps/p5lab/spritelab/commands/actionCommands';
import * as coreLibrary from '@cdo/apps/p5lab/spritelab/coreLibrary';
import createP5Wrapper from '../../util/gamelab/TestableP5Wrapper';

describe('Sprite Commands', () => {
  let p5Wrapper, makeSprite, animation;
  const sprite1Name = 'sprite1';
  const sprite2Name = 'sprite2';
  const sprite3Name = 'sprite3';
  beforeEach(function() {
    p5Wrapper = createP5Wrapper();
    makeSprite = commands.makeSprite.bind(p5Wrapper.p5);
    let image = new p5.Image(100, 100, p5Wrapper.p5);
    let frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
    let sheet = new p5Wrapper.p5.SpriteSheet(image, frames);
    animation = new p5Wrapper.p5.Animation(sheet);
    coreLibrary.reset();
  });

  it('countByAnimation', () => {
    p5Wrapper.p5._predefinedSpriteAnimations = {a: animation, b: animation};
    makeSprite({name: sprite1Name, animation: 'a'});
    makeSprite({name: sprite2Name, animation: 'b'});
    makeSprite({name: sprite3Name, animation: 'a'});

    expect(commands.countByAnimation({costume: 'a'})).to.equal(2);
    expect(commands.countByAnimation({costume: 'b'})).to.equal(1);
    expect(commands.countByAnimation({costume: 'c'})).to.equal(0);

    expect(commands.countByAnimation({name: sprite1Name})).to.equal(1);
  });

  it('destroy single sprite', () => {
    makeSprite({name: sprite1Name});
    makeSprite({name: sprite2Name});

    expect(coreLibrary.getSpriteIdsInUse()).to.have.members([0, 1]);

    commands.destroy({name: sprite1Name});
    expect(coreLibrary.getSpriteIdsInUse()).to.have.members([1]);

    commands.destroy({name: sprite2Name});
    expect(coreLibrary.getSpriteIdsInUse()).to.have.members([]);
  });

  it('destroy animation group', () => {
    p5Wrapper.p5._predefinedSpriteAnimations = {a: animation, b: animation};
    makeSprite({name: sprite1Name, animation: 'a'});
    makeSprite({name: sprite2Name, animation: 'b'});
    makeSprite({name: sprite3Name, animation: 'a'});

    commands.destroy({costume: 'a'});

    expect(coreLibrary.getSpriteIdsInUse()).to.have.members([1]);
  });

  it('getProp for single sprite', () => {
    p5Wrapper.p5._predefinedSpriteAnimations = {label: animation};
    makeSprite({
      name: sprite1Name,
      animation: 'label',
      location: {x: 123, y: 321}
    });
    actionCommands.setProp({name: sprite1Name}, 'anotherProp', 'value');

    expect(commands.getProp({name: sprite1Name}, 'x')).to.equal(123);
    expect(commands.getProp({name: sprite1Name}, 'y')).to.equal(400 - 321);
    expect(commands.getProp({name: sprite1Name}, 'costume')).to.equal('label');
    expect(commands.getProp({name: sprite1Name}, 'anotherProp')).to.equal(
      'value'
    );
  });

  it('getProp for animation group uses the first sprite in the group', () => {
    p5Wrapper.p5._predefinedSpriteAnimations = {label: animation};
    makeSprite({
      name: sprite1Name,
      animation: 'label',
      location: {x: 123, y: 321}
    });
    makeSprite({
      name: sprite2Name,
      animation: 'label',
      location: {x: 321, y: 123}
    });

    expect(commands.getProp({costume: 'label'}, 'x')).to.equal(123);
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
      makeSprite({name: sprite1Name});
      expect(commands.getProp({name: sprite1Name}, 'x')).to.equal(200);
      expect(commands.getProp({name: sprite1Name}, 'y')).to.equal(200);
    });

    it('location picker works', () => {
      makeSprite({name: sprite1Name, location: {x: 123, y: 321}});
      expect(commands.getProp({name: sprite1Name}, 'x')).to.equal(123);
      expect(commands.getProp({name: sprite1Name}, 'y')).to.equal(400 - 321);
    });

    it('location function works', () => {
      let locationFunc = () => ({x: 123, y: 321});
      makeSprite({name: sprite1Name, location: locationFunc});
      expect(commands.getProp({name: sprite1Name}, 'x')).to.equal(123);
      expect(commands.getProp({name: sprite1Name}, 'y')).to.equal(400 - 321);
    });

    it('setting animation works', () => {
      p5Wrapper.p5._predefinedSpriteAnimations = {costume_label: animation};
      makeSprite({name: sprite1Name, animation: 'costume_label'});
      expect(commands.getProp({name: sprite1Name}, 'costume')).to.equal(
        'costume_label'
      );
    });
  });

  it('setAnimation for single sprite', () => {
    p5Wrapper.p5._predefinedSpriteAnimations = {costume_label: animation};
    makeSprite({name: sprite1Name});
    commands.setAnimation({name: sprite1Name}, 'costume_label');
    expect(commands.getProp({name: sprite1Name}, 'costume')).to.equal(
      'costume_label'
    );
  });

  it('setAnimation for animation group', () => {
    p5Wrapper.p5._predefinedSpriteAnimations = {
      a: animation,
      costume_label: animation
    };
    makeSprite({name: sprite1Name, animation: 'a'});
    makeSprite({name: sprite2Name, animation: 'a'});
    makeSprite({name: sprite3Name, animation: 'a'});

    commands.setAnimation({costume: 'a'}, 'costume_label');

    expect(coreLibrary.getAnimationsInUse()).to.deep.equal(['costume_label']);
  });
});
