import {expect} from '../../util/configuredChai';
const testUtils = require('../../util/testUtils');
testUtils.setupLocales();
const Artist = require('@cdo/apps/turtle/turtle');
const constants = require('@cdo/apps/constants');

describe('Artist', () => {
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
