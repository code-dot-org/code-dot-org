/** @file Some misc. browser check methods for maker */

export function gtChrome33() {
  return getChromeVersion() >= 33;
}

export function isChrome() {
  return !!window.chrome;
}

export function getChromeVersion() {
  const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  return raw ? parseInt(raw[2], 10) : false;
}

export function isWindows() {
  return navigator.platform.indexOf('Win') > -1;
}
