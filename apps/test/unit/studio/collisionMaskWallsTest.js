import {expect} from '../../util/deprecatedChai';
import CollisionMaskWalls from '@cdo/apps/studio/collisionMaskWalls';

describe('collisionMaskWalls', function() {
  var walls;
  beforeEach(function(done) {
    const skin = {
      gridAlignedMovement: false,
      wallCollisionRectOffsetX: 0,
      wallCollisionRectOffsetY: 0,
      wallMaps: {
        block: {
          // This is a map with a 200x200 wall centered in the middle of the 400x400 map
          srcUrl:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAAABmJLR0QA/wD/AP+gvaeTAAAFsElEQVR4nO3XsQ0CQRAEQQ59/ikvLu9BOwtSVQTjtebMzDwA4EvP7QEA/CcBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREACSa3sAd+ec7Qnws2ZmewJvPBAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAEgEBIBEQABIBASAREAASAQEgERAAkmt7AHczsz0B4CMeCACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAiYAAkAgIAImAAJAICACJgACQCAgAyQukmA0dlzDgswAAAABJRU5ErkJggg=='
        }
      }
    };
    const drawDebug = () => {};

    walls = new CollisionMaskWalls(
      {},
      skin,
      drawDebug,
      drawDebug,
      400,
      400,
      done
    );
    walls.setWallMapRequested('block');
  });

  it('doesnt touch a 10x10 sprite in the top left', function() {
    expect(walls.willRectTouchWall(5, 5, 10, 10)).to.be.false;
  });

  it('touches a 10x10 sprite in the middle of the map', function() {
    expect(walls.willRectTouchWall(200, 200, 10, 10)).to.be.true;
  });

  it('touches with an overlap of 1 pixel', function() {
    expect(walls.willRectTouchWall(96, 96, 10, 10)).to.be.true;
  });

  it("doesn't touch when the sprite is immediately above", function() {
    expect(walls.willRectTouchWall(200, 95, 10, 10)).to.be.false;
  });

  it("doesn't touch when the sprite is immediately below", function() {
    expect(walls.willRectTouchWall(200, 305, 10, 10)).to.be.false;
  });

  it("doesn't touch when the sprite is immediately to the left", function() {
    expect(walls.willRectTouchWall(95, 200, 10, 10)).to.be.false;
  });
  it("doesn't touch when the sprite is immediately to the right", function() {
    expect(walls.willRectTouchWall(200, 305, 10, 10)).to.be.false;
  });

  describe('hexToRgb', function() {
    const hexToRgb = CollisionMaskWalls.hexToRgb;

    it('parses normal colors', function() {
      expect(hexToRgb('#7F7F7F')).to.deep.equal({R: 127, G: 127, B: 127});
      expect(hexToRgb('#000000')).to.deep.equal({R: 0, G: 0, B: 0});
      expect(hexToRgb('#FFFFFF')).to.deep.equal({R: 255, G: 255, B: 255});
      expect(hexToRgb('#00adbc')).to.deep.equal({R: 0, G: 0xad, B: 0xbc});
    });

    it('parses short forms', function() {
      expect(hexToRgb('#000')).to.deep.equal({R: 0, G: 0, B: 0});
      expect(hexToRgb('#fff')).to.deep.equal({R: 255, G: 255, B: 255});
      expect(hexToRgb('#777')).to.deep.equal({R: 0x77, G: 0x77, B: 0x77});
    });

    it('parses primary colors', function() {
      expect(hexToRgb('#FF0000')).to.deep.equal({R: 255, G: 0, B: 0});
      expect(hexToRgb('#00FF00')).to.deep.equal({R: 0, G: 255, B: 0});
      expect(hexToRgb('#00F')).to.deep.equal({R: 0, G: 0, B: 255});
    });
  });
});
