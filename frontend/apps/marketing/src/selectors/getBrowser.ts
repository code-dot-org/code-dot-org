import Bowser from 'bowser';

export function getBrowser() {
  if (typeof navigator === 'undefined' || !navigator.userAgent)
    return undefined;
  // eslint-disable-next-line import-x/no-named-as-default-member
  return Bowser.getParser(navigator.userAgent)?.getResult();
}

// WebKit is the engine used by Safari and all iOS browsers regardless of branding
export function isWebKitEngine() {
  return getBrowser()?.engine?.name === 'WebKit';
}
