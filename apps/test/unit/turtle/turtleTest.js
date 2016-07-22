import {expect} from '../../util/configuredChai';
var Artist = require('@cdo/apps/turtle/turtle');

var SHORT_DIAGONAL = 50 * Math.sqrt(2);
var VERY_LONG_DIAGONAL = 150 * Math.sqrt(2);

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
});
