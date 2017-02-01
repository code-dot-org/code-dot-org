/** @file Test maker droplet config behavior */
import {expect} from '../../util/configuredChai';
import {getBoardEventDropdownForParam} from '@cdo/apps/makerlab/dropletConfig';

describe('getBoardEventDropdownForParam', function () {
  it('unknown first parameter dropdown contains all options', function () {
    expect(getBoardEventDropdownForParam('unknown')).to.deep.equal([
      '"change"',
      '"close"',
      '"data"',
      '"down"',
      '"open"',
      '"press"',
      '"up"'
    ]);
  });

  it('buttonL dropdown', function () {
    expect(getBoardEventDropdownForParam('buttonL')).to.deep.equal([
      '"down"',
      '"press"',
      '"up"'
    ]);
  });

  it('buttonR dropdown', function () {
    expect(getBoardEventDropdownForParam('buttonR')).to.deep.equal([
      '"down"',
      '"press"',
      '"up"'
    ]);
  });

  it('toggleSwitch dropdown', function () {
    expect(getBoardEventDropdownForParam('toggleSwitch')).to.deep.equal([
      '"close"',
      '"open"'
    ]);
  });

  it('accelerometer dropdown', function () {
    expect(getBoardEventDropdownForParam('accelerometer')).to.deep.equal([
      '"change"',
      '"data"'
    ]);
  });

  it('soundSensor dropdown', function () {
    expect(getBoardEventDropdownForParam('soundSensor')).to.deep.equal([
      '"change"',
      '"data"'
    ]);
  });

  it('lightSensor dropdown', function () {
    expect(getBoardEventDropdownForParam('lightSensor')).to.deep.equal([
      '"change"',
      '"data"'
    ]);
  });

  it('tempSensor dropdown', function () {
    expect(getBoardEventDropdownForParam('tempSensor')).to.deep.equal([
      '"change"',
      '"data"'
    ]);
  });

  describe('touchPads', function () {
    [0, 1, 2, 3, 6, 9, 10, 12].forEach(pin => {
      it(`touchPad${pin} dropdown`, function () {
        expect(getBoardEventDropdownForParam(`touchPad${pin}`)).to.deep.equal([
          '"down"',
          '"up"'
        ]);
      });
    });
  });
});
