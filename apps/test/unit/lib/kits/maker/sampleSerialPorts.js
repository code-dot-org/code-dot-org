/**
 * Sample serial port objects for testing BoardController device detection.
 */

export const OSX_DEFAULT_PORTS = [
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

export const FLORA_PORTS = [
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

export const REDBOARD_PORTS = [
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
