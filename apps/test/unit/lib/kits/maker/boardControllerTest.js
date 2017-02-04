import sinon from 'sinon';
import {assert, expect} from '../../../../util/configuredChai';
import {REDBOARD_PORTS, FLORA_PORTS, OSX_DEFAULT_PORTS} from './sampleSerialPorts';
import BoardController from '@cdo/apps/lib/kits/maker/BoardController';

const deviceOnPortAppearsUsable = BoardController.__testonly__.deviceOnPortAppearsUsable;

describe("BoardController", function () {
  it("deviceOnPortAppearsUsable", function () {
    assertPortsUsable(FLORA_PORTS);
    assertPortsUsable(REDBOARD_PORTS);
    assertPortsUnusable(OSX_DEFAULT_PORTS);
  });

  describe('event aliases', function () {
    let boardController, fakeEventEmitter, callback;

    beforeEach(function () {
      boardController = new BoardController();
      fakeEventEmitter = { on: sinon.spy() };
      callback = () => {};
    });

    it(`aliases 'tap:single' event to 'singleTap'`, function () {
      boardController.onBoardEvent(fakeEventEmitter, 'singleTap', callback);
      expect(fakeEventEmitter.on).to.have.been.calledWith('tap:single', callback);
    });

    it(`aliases 'tap:double' event to 'doubleTap'`, function () {
      boardController.onBoardEvent(fakeEventEmitter, 'doubleTap', callback);
      expect(fakeEventEmitter.on).to.have.been.calledWith('tap:double', callback);
    });
  });
});

function assertPortsUsable(list) {
  list.forEach(function (port) {
    assert(deviceOnPortAppearsUsable(port),
        "Device " + JSON.stringify(port) + " should be recognized as usable.");
  });
}

function assertPortsUnusable(list) {
  list.forEach(function (port) {
    assert(!deviceOnPortAppearsUsable(port),
        "Device " + JSON.stringify(port) + " should not be recognized as usable.");
  });
}
