import {Brand} from '@/config/brand';

/**
 * Returns the LocalizeJS widget JavaScript path.
 *
 * You can specify a version if you need to lock the widget code to a particular
 * version. Either to force it to a newer version before that version is 'stable'
 * or to lock to a prior version if a new version misbehaves.
 *
 * Generally, it is best to not specify the version number and the widget will
 * be initialized to the newest version found in the CDN.
 *
 * @param version The optional revision number for locking the widget.
 */
export function getLocalizePath(version?: number): string {
  return `https://global.localizecdn.com/localize${version ? `.${version}` : ''}.js`;
}

/**
 * Returns the project id (given to us by Localize) for the dictionary to
 * target our translations.
 *
 * If the project id returned is empty, it should fail to load the widget.
 *
 * @param brand Code.org brand
 */
export function getProjectId(brand: Brand): string {
  switch (brand) {
    case Brand.CODE_DOT_ORG:
      return 'ttv8iUlCkVIPo';
    case Brand.CS_FOR_ALL:
      return 'oYxcqdBRv0Lqd';
    case Brand.HOUR_OF_CODE:
      // When hourofcode is to be translated, add the project ID here
      return '';
    default:
      return '';
  }
}
