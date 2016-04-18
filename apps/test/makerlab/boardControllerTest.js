var testUtils = require('../util/testUtils');

var BoardController = require('@cdo/apps/makerlab/BoardController');
var assert = testUtils.assert;

var OSX_DEFAULT_PORTS = [
  {
    "comName": "/dev/cu.Bluetooth-Incoming-Port",
    "serialNumber": "",
    "pnpId": "",
    "locationId": "",
    "vendorId": "0x0",
    "productId": "0x0"
  },
  {
    "comName": "/dev/cu.Bluetooth-Modem",
    "serialNumber": "",
    "pnpId": "",
    "locationId": "",
    "vendorId": "0x0",
    "productId": "0x0"
  },
  {
    "comName": "/dev/tty.Bluetooth-Incoming-Port",
    "serialNumber": "",
    "pnpId": "",
    "locationId": "",
    "vendorId": "0x0",
    "productId": "0x0"
  },
  {
    "comName": "/dev/tty.Bluetooth-Modem",
    "serialNumber": "",
    "pnpId": "",
    "locationId": "",
    "vendorId": "0x0",
    "productId": "0x0"
  }
];

var FLORA_PORTS = [
  {
    "comName": "/dev/cu.usbmodem1411",
    "manufacturer": "Flora",
    "serialNumber": "",
    "pnpId": "",
    "locationId": "",
    "vendorId": "0x239a",
    "productId": "0x8004"
  },
  {
    "comName": "/dev/tty.usbmodem1411",
    "manufacturer": "Flora",
    "serialNumber": "",
    "pnpId": "",
    "locationId": "",
    "vendorId": "0x239a",
    "productId": "0x8004"
  }
];

var REDBOARD_PORTS = [
  {
    "comName": "/dev/cu.usbserial-ABCDE123",
    "manufacturer": "FT232R USB UART",
    "serialNumber": "",
    "pnpId": "",
    "locationId": "",
    "vendorId": "0x403",
    "productId": "0x6001"
  },
  {
    "comName": "/dev/tty.usbserial-ABCDE123",
    "manufacturer": "FT232R USB UART",
    "serialNumber": "",
    "pnpId": "",
    "locationId": "",
    "vendorId": "0x403",
    "productId": "0x6001"
  }
];

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
