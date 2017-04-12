import {stub} from 'sinon';
import GameLabGame from '@cdo/apps/gamelab/GameLabGame';
import {expect} from '../../util/configuredChai';

describe('seconds', function () {
  it('returns time passed in seconds', function () {
    stub(Date.prototype, 'getTime');
    // Time at the start of the program.
    Date.prototype.getTime.onCall(0).returns(5300);
    // Time when seconds gets called.
    Date.prototype.getTime.onCall(1).returns(10000);

    let gameLabGame = new GameLabGame({});
    expect(gameLabGame.seconds).to.equal(5);
    Date.prototype.getTime.restore();
  });
});
