/** @file Some misc. browser check methods for maker */

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
