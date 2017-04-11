import {expect} from '../../util/configuredChai';
const Artist = require('@cdo/apps/turtle/turtle');
const constants = require('@cdo/apps/constants');

const SHORT_DIAGONAL = 50 * Math.sqrt(2);
const VERY_LONG_DIAGONAL = 150 * Math.sqrt(2);

describe('Artist', () => {
  describe('drawing with joints', () => {
    var joints, segments, artist;
    beforeEach(() => {
      artist = new Artist();
      joints = 0;
      segments = [];
      artist.drawJointAtTurtle_ = () => { joints += 1; };
      artist.drawForwardLine_ = (dist) => { segments.push(dist); };
    });
    it('draws 2 joints on a short segment', () => {
      artist.drawForwardWithJoints_(50, false);

      expect(joints).to.equal(2);
      expect(segments).to.eql([50]);
    });
    it('draws 3 joints on a long segment', () => {
      artist.drawForwardWithJoints_(100, false);

      expect(joints).to.equal(3);
      expect(segments).to.eql([50, 50]);
    });
    it('draws no joints on a very short segment', () => {
      artist.drawForwardWithJoints_(10, false);

      expect(joints).to.equal(0);
      expect(segments).to.eql([10]);
    });
    it('draws 2 joints on a short diagonal segment', () => {
      artist.drawForwardWithJoints_(SHORT_DIAGONAL, true);

      expect(joints).to.equal(2);
      expect(segments).to.eql([SHORT_DIAGONAL]);
    });
    it('draws 4 joints on a very long diagonal segment', () => {
      artist.drawForwardWithJoints_(VERY_LONG_DIAGONAL, true);

      expect(joints).to.equal(4);
      expect(segments).to.eql([SHORT_DIAGONAL, SHORT_DIAGONAL, SHORT_DIAGONAL]);
    });
    it('draws no joints on a very short diagonal segment', () => {
      artist.drawForwardWithJoints_(SHORT_DIAGONAL - 1, true);

      expect(joints).to.equal(0);
      expect(segments).to.eql([SHORT_DIAGONAL - 1]);
    });
  });

  describe('jumpTo', () => {
    let artist;
    beforeEach(() => {
      artist = new Artist();
    });

    it('can jump to coordinates', () => {
      const coords = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

      coords.forEach(x => {
        coords.forEach(y => {
          artist.jumpTo_([x, y]);
          expect(artist.x).to.equal(x);
          expect(artist.y).to.equal(y);
        });
      });
    });

    it('can jump to a position', () => {
      const expectations = {
        TOPLEFT:      [0, 0],
        TOPCENTER:    [200, 0],
        TOPRIGHT:     [400, 0],
        MIDDLELEFT:   [0, 200],
        MIDDLECENTER: [200, 200],
        MIDDLERIGHT:  [400, 200],
        BOTTOMLEFT:   [0, 400],
        BOTTOMCENTER: [200, 400],
        BOTTOMRIGHT:  [400, 400]
      };

      Object.keys(expectations).forEach(position => {
        const [x, y] = expectations[position];
        artist.jumpTo_(constants.Position[position]);
        expect(artist.x).to.equal(x);
        expect(artist.y).to.equal(y);
      });
    });
  });
});
