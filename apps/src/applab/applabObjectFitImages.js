import objectFitImages from 'object-fit-images';

/**
 * Wrapper to objectFitImages() to avoid using it on phantomjs
 * See https://github.com/bfred-it/object-fit-images/issues/11
 */

export function applabObjectFitImages(imgs, opts) {
  if (/PhantomJS/.test(window.navigator.userAgent)) {
    return;
  }
  objectFitImages(imgs, opts);
}
