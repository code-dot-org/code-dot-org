/** @file Some misc. browser check methods for maker */
/* global SerialPort */ // Maybe provided by the Code.org Browser
import ChromeSerialPort from 'chrome-serialport';

export function gtChrome33() {
  return getChromeVersion() >= 33;
}

export function isChrome() {
  return !!window.chrome;
}

export function isCodeOrgBrowser() {
  return !!window.MakerBridge;
}

function getChromeVersion() {
  const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  return raw ? parseInt(raw[2], 10) : false;
}

export function isWindows() {
  return /^Win/.test(navigator.platform);
}

export function isOSX() {
  return /^Mac/.test(navigator.platform);
}

export function isChromeOS() {
  return /\bCrOS\b/.test(navigator.userAgent);
}

export function isLinux() {
  return /^Linux/.test(navigator.platform) && !isChromeOS();
}

/*
  A gotcha here: These two types of SerialPort provide similar, but not
  exactly equivalent, interfaces.  When making changes to construction
  here maker sure to test both paths:

  Code.org Browser case: Native Node SerialPort 6 is available on window.

  Code.org connector app case: ChromeSerialPort bridges through the Chrome
  app, implements SerialPort 3's interface.

  @param {boolean} getFactory - optional - ChromeSerialPort is a factory.
    Parameter determines whether to return the factory of the SerialPort
 */
export function serialPortType(getFactory = null) {
  if (!isChromeOS()) {
    return SerialPort;
  } else {
    if (getFactory) {
      return ChromeSerialPort;
    } else {
      return ChromeSerialPort.SerialPort;
    }
  }
}
