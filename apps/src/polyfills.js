/**
 * A low-performance polyfill for toBlob based on toDataURL. Adapted from:
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
 */
if (!HTMLCanvasElement.prototype.toBlob) {
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function (callback, type, quality) {
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
