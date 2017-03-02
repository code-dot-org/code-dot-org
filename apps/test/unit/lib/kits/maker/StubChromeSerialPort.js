/**
 * @file Stand-in for chrome-serialport library, for use in tests.
 */
class SerialPort {}

let deviceList = [];

export default {
  SerialPort,

  isInstalled(callback) {
    callback(null);
  },

  // Give back a valid list of serial port info
  list(callback) {
    callback(null, deviceList);
  },

  stub: {
    setDeviceList(list) {
      deviceList = list;
    },

    reset() {
      deviceList = [];
    }
  }
};
