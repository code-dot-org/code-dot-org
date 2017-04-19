import {stub} from 'sinon';
import GameLabWorld from '@cdo/apps/gamelab/GameLabWorld';
import {expect} from '../../util/configuredChai';

describe('seconds', function () {
  it('returns time passed in seconds', function () {
    stub(Date.prototype, 'getTime');
    // Time at the start of the program.
    Date.prototype.getTime.onCall(0).returns(5300);
    // Time when seconds gets called.
    Date.prototype.getTime.onCall(1).returns(10000);

    let gameLabWorld = new GameLabWorld({});
    expect(gameLabWorld.seconds).to.equal(5);
    Date.prototype.getTime.restore();
  });
});
