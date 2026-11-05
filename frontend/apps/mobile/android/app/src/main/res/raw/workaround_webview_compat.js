// TEMPORARY WORKAROUND, patching studio.code.org from the app. It is here to
// learn whether the site itself should do this; if it should, move it into
// the site and delete this file.
//
// The site's code calls these, which WebViews before Chromium 103 lack;
// without Object.hasOwn, Music Lab and Dance Party fail to load. Each is
// defined only where missing, with the standard behavior.
function polyfill(target, name, value) {
  if (!(name in target)) {
    Object.defineProperty(target, name, {
      configurable: true,
      writable: true,
      value: value,
    });
  }
}
polyfill(Object, 'hasOwn', function (object, key) {
  return Object.prototype.hasOwnProperty.call(Object(object), key);
});
function at(index) {
  var length = this.length;
  var i = Math.trunc(index) || 0;
  i = i < 0 ? length + i : i;
  return i < 0 || i >= length ? undefined : this[i];
}
[Array.prototype, String.prototype].forEach(function (proto) {
  polyfill(proto, 'at', at);
});
if (typeof Int8Array !== 'undefined') {
  polyfill(Object.getPrototypeOf(Int8Array.prototype), 'at', at);
}
polyfill(Array.prototype, 'findLast', function (predicate, thisArg) {
  for (var i = this.length - 1; i >= 0; i--) {
    if (predicate.call(thisArg, this[i], i, this)) {
      return this[i];
    }
  }
  return undefined;
});
polyfill(Array.prototype, 'findLastIndex', function (predicate, thisArg) {
  for (var i = this.length - 1; i >= 0; i--) {
    if (predicate.call(thisArg, this[i], i, this)) {
      return i;
    }
  }
  return -1;
});
if (typeof AbortSignal !== 'undefined') {
  polyfill(AbortSignal, 'timeout', function (ms) {
    var controller = new AbortController();
    setTimeout(function () {
      controller.abort(new DOMException('signal timed out', 'TimeoutError'));
    }, ms);
    return controller.signal;
  });
}

// Android's WebView has no speechSynthesis, and the Lab2 labs (Music Lab,
// Music Lab: Jam Session and others) read it at load and fail without it.
// This stand-in lets them load; read-aloud is silent until the app bridges
// to Android's text-to-speech.
if (!('speechSynthesis' in window)) {
  var noop = function () {};
  window.speechSynthesis = {
    speaking: false,
    pending: false,
    paused: false,
    onvoiceschanged: null,
    speak: noop,
    cancel: noop,
    pause: noop,
    resume: noop,
    getVoices: function () {
      return [];
    },
    addEventListener: noop,
    removeEventListener: noop,
  };
  window.SpeechSynthesisUtterance = function (text) {
    this.text = text || '';
    this.lang = 'en-US';
    this.rate = 1;
    this.pitch = 1;
    this.volume = 1;
    this.voice = null;
  };
}
