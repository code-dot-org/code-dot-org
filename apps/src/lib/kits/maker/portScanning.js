/** @file Serialport scanning logic for Maker Toolkit */

/**
 * @typedef {Object} SerialPortInfo
 * @property {string} comName (a port id) e.g. "COM3" or "/dev/ttyACM0"
 * @property {string} manufacturer e.g. "Adafruit Circuit Playground"
 * @property {string} productId e.g. "0x8011"
 * @property {string} vendorId e.g. "0x239a"
 */

/** @const {string} Adafruit's vendor id as reported by Circuit Playground boards */
export const ADAFRUIT_VID = 0x239a;

/** @const {string} The Circuit Playground product id as reported by Circuit playground boards */
export const CIRCUIT_PLAYGROUND_PID = 0x8011;

/** @const {string} The Circuit Playground Express product id */
export const CIRCUIT_PLAYGROUND_EXPRESS_PID = 0x8018;

/** @const {string} The micro:bit vendor id as reported by micro:bit boards */
export const MICROBIT_VID = 0x0d28;

/** @const {string} The micro:bit product id */
export const MICROBIT_PID = 0x0204;
