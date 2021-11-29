import wickedGoodXpath from 'wgxpath';

/**
 * A low-performance polyfill for toBlob based on toDataURL. Adapted from:
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
 */
if (!HTMLCanvasElement.prototype.toBlob) {
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function(callback, type, quality) {
      const binStr = atob(this.toDataURL(type, quality).split(',')[1]);
      const arr = new Uint8Array(binStr.length);

      for (let i = 0; i < binStr.length; i++) {
        arr[i] = binStr.charCodeAt(i);
      }

      const blob = new Blob([arr], {type: type || 'image/png'});
      callback(blob);
    }
  });
}

/**
 * Polyfill for svg.getElementsByClassName for IE11
 * From https://github.com/clientIO/joint/issues/117#issuecomment-194699222
 */
if (SVGElement.prototype.getElementsByClassName === undefined) {
  SVGElement.prototype.getElementsByClassName = function(className) {
    return this.querySelectorAll('.' + className);
  };
}

/**
 * Polyfill for document.evaluate for IE
 */
if (!document.evaluate) {
  wickedGoodXpath.install(window);
}
