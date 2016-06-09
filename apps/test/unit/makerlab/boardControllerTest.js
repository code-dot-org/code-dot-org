import {assert} from '../../util/configuredChai';
import {REDBOARD_PORTS, FLORA_PORTS, OSX_DEFAULT_PORTS} from './sampleSerialPorts';

var BoardController = require('@cdo/apps/makerlab/BoardController');

var deviceOnPortAppearsUsable = BoardController.__testonly__.deviceOnPortAppearsUsable;

describe("BoardController", function () {
  it("deviceOnPortAppearsUsable", function () {
    assertPortsUsable(FLORA_PORTS);
    assertPortsUsable(REDBOARD_PORTS);
    assertPortsUnusable(OSX_DEFAULT_PORTS);
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
