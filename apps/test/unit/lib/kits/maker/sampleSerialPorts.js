/**
 * Sample serial port objects for testing maker device detection.
 * See sample Adafruit board configurations at https://github.com/adafruit/Adafruit_Arduino_Boards/blob/master/boards.txt
 */

export const CIRCUIT_PLAYGROUND_PORTS = [
  // Reported by a teacher's Win10 laptop
  {
    comName: "COM5",
    manufacturer: "Adafruit Circuit Playground",
    serialNumber: "",
    pnpId: "",
    locationId: "",
    vendorId: "0x239a",
    productId: "0x8011"
  },
  // Reported by Brad's laptop, Ubuntu 16.04
  {
    comName: "/dev/ttyACM0",
    manufacturer: "Adafruit Circuit Playground",
    serialNumber: "",
    pnpId: "",
    locationId: "",
    vendorId: "0x239a",
    productId: "0x8011"
  }
];
export const CIRCUIT_PLAYGROUND_EXPRESS_PORTS = [
  {
    comName: "COM5",
    manufacturer: "Adafruit",
    serialNumber: undefined,
    pnpId: "usb-Adafruit_Circuit_Playground_Express-if00",
    locationId: "",
    vendorId: "239a",
    productId: "8018"
  },
  // Reported by Brad's laptop, Ubuntu 18.04
  {
    comName: "/dev/ttyACM0",
    manufacturer: "Adafruit",
    serialNumber: undefined,
    pnpId: "usb-Adafruit_Circuit_Playground_Express-if00",
    locationId: "",
    vendorId: "239a",
    productId: "8018"
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

// Bad serialport profiles we've run into in the wild
export const OTHER_BAD_SERIALPORTS = [
  // This is the fingerprint for a real, remote-control tech we found on a
  // teacher's laptop. It uses a serial port and was interfering with our
  // setup tech.
  {
    comName: 'COM5',
    manufacturer: 'Intel(R) Active Management Technology - SOL',
    serialNumber: "",
    pnpId: "",
    locationId: "",
    vendorId: '0x0',
    productId: '0x0'
  }
];
