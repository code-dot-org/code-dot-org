/** @file Stubbable core setup check behavior for the setup page. */
import CircuitPlaygroundBoard from '../boards/circuitPlayground/CircuitPlaygroundBoard';
import {ensureAppInstalled, findPortWithViableDevice} from '../portScanning';
import {
  isCodeOrgBrowser,
  isChrome,
  gtChrome33,
  isChromeOS
} from './browserChecks';
import {
  BOARD_TYPE,
  detectBoardTypeFromPort,
  isWebSerialPort
} from './boardUtils';
import MicroBitBoard from '../boards/microBit/MicroBitBoard';
import {
  isUniversalHex,
  separateUniversalHex
} from '@microbit/microbit-universal-hex';
import {DAPLink, WebUSB} from 'dapjs';

export default class SetupChecker {
  constructor(webSerialPort) {
    this.port = null;
    this.boardController = null;
    this.hexStr = null;
    if (webSerialPort) {
      this.port = webSerialPort;
    }
  }

  /**
   * Resolve if using Chrome > 33 or Code.org Browser
   * @return {Promise}
   */
  detectSupportedBrowser() {
    return new Promise((resolve, reject) => {
      if (isCodeOrgBrowser()) {
        // TODO: Check browser version
        resolve();
      } else if (isChromeOS()) {
        resolve();
      } else if (isChrome() && gtChrome33()) {
        // Legacy support for Chrome App on Desktop
        resolve();
      } else {
        reject(new Error('Not using a supported browser.'));
      }
    });
  }

  /**
   * Resolve if the Chrome Connector App is installed.
   * @return {Promise}
   */
  detectChromeAppInstalled() {
    return ensureAppInstalled();
  }

  /**
   * @return {Promise}
   */
  detectBoardPluggedIn() {
    if (!isWebSerialPort(this.port)) {
      return findPortWithViableDevice().then(port => (this.port = port));
    }

    // In the Web Serial Experiment, user already selected port
    return Promise.resolve(this.port);
  }

  /**
   * @return {Promise}
   */
  detectCorrectFirmware(boardType) {
    if (boardType === BOARD_TYPE.MICROBIT) {
      this.boardController = new MicroBitBoard(this.port);
      return this.boardController.checkExpectedFirmware().catch(err => {
        return Promise.reject(err);
      });
    } else {
      this.boardController = new CircuitPlaygroundBoard(this.port);
      return this.boardController.connectToFirmware();
    }
  }

  /**
   * Return the type of board connected to port.
   * @return {string}
   */
  detectBoardType() {
    return detectBoardTypeFromPort(this.port);
  }

  /**
   * @return {Promise}
   */
  detectComponentsInitialize() {
    return this.boardController.initializeComponents();
  }

  /**
   * @return {Promise}
   */
  celebrate() {
    return this.boardController.celebrateSuccessfulConnection();
  }

  teardown() {
    const releaseRefs = () => {
      this.boardController = null;
      this.port = null;
    };

    if (this.boardController) {
      this.boardController.destroy().then(releaseRefs);
    } else {
      releaseRefs();
    }
  }

  async updateMBFirmata() {
    console.log('inside SetupChecker.js');
    await fetch('https://downloads.code.org/maker/microbit-firmata-v1.2.hex')
      .then(res => {
        return res.text();
      })
      .then(res => {
        this.hexStr = res;
      })
      .then(() => this.selectDevice())
      .catch(err => console.log(err));
  }

  // Choose a device
  selectDevice = async () => {
    try {
      const device = await navigator.usb.requestDevice({
        filters: [{vendorId: 0x0d28, productId: 0x0204}]
      });
      await this.update(device);
    } catch (error) {
      console.log(error);
    }
  };

  // Update a device with the firmware image
  update = async device => {
    if (!this.hexStr) {
      return;
    }

    const transport = new WebUSB(device);
    const target = new DAPLink(transport);
    // If it is a Universal Hex, separate it, and pick the right one for the connected micro:bit version
    if (isUniversalHex(this.hexStr)) {
      let hexV1 = null;
      let hexV2 = null;
      let separatedBinaries = separateUniversalHex(this.hexStr);
      separatedBinaries.forEach(function(hexObj) {
        if (hexObj.boardId === 0x9900 || hexObj.boardId === 0x9901) {
          hexV1 = hexObj.hex;
        } else if (
          hexObj.boardId === 0x9903 ||
          hexObj.boardId === 0x9904 ||
          hexObj.boardId === 0x9905 ||
          hexObj.boardId === 0x9906
        ) {
          hexV2 = hexObj.hex;
        }
      });
      // if (microbitId === '9900' || microbitId === '9901') {
      //   this.hexStr = hexV1;
      // } else if (
      //   microbitId === '9903' ||
      //   microbitId === '9904' ||
      //   microbitId === '9905' ||
      //   microbitId === '9906'
      // ) {
      //   this.hexStr = hexV2;
      // }
    }

    // Intel Hex is currently in ASCII, do a 1-to-1 conversion from chars to bytes
    let hexBuffer = new Uint8Array(this.hexStr.length);
    for (let i = 0; i < this.hexStr.length; i++) {
      hexBuffer[i] = this.hexStr.charCodeAt(i);
    }

    try {
      // Push binary to board
      await target.connect();
      await target.flash(hexBuffer);
      await target.disconnect();
    } catch (error) {
      console.log(error);
    }
  };
}
