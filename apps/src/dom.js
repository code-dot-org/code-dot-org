exports.addReadyListener = function(callback) {
  if (document.readyState === 'complete') {
    setTimeout(callback, 1);
  } else {
    window.addEventListener('load', callback, false);
  }
};

exports.getTouchEventName = function(eventName) {
  var isIE11Touch = window.navigator.pointerEnabled;
  var isIE10Touch = window.navigator.msPointerEnabled;
  var isStandardTouch = !(isIE11Touch || isIE10Touch);

  var key;
  if (isIE11Touch) {
    key = 'ie11';
  } else if (isIE10Touch) {
    key = 'ie10';
  } else if (isStandardTouch) {
    key = 'standard';
  }
  if (key && TOUCH_MAP[eventName]) {
    return TOUCH_MAP[eventName][key];
  }
};

/**
 * Add an event listener
 * @param {HTMLElement} element
 * @param {string} eventName
 * @param {function) handler
 * @param {boolean} suppressTouchDefault - Should we preventDefault on touch events
 */
var addEvent = function(
  element,
  eventName,
  handler,
  suppressTouchDefault = true
) {
  // Scope bound event map to this addEvent call - we only provide for unbinding
  // what we bind right here.
  var boundEvents = {};

  var bindEvent = function(type, eventName, handler) {
    element.addEventListener(eventName, handler, false);
    boundEvents[type] = {name: eventName, handler: handler};
  };

  var unbindEvent = function(type) {
    var eventInfo = boundEvents[type];
    if (eventInfo) {
      element.removeEventListener(eventInfo.name, eventInfo.handler);
      delete boundEvents[type];
    }
  };

  // Add click handler
  bindEvent('click', eventName, handler);

  // Optionally add touch handler
  var touchEvent = exports.getTouchEventName(eventName);
  if (touchEvent) {
    bindEvent('touch', touchEvent, function(e) {
      // Stop mouse events and suppress default event handler to prevent
      // unintentional double-clicking
      if (suppressTouchDefault) {
        e.preventDefault();
      }

      // ---- Workaround for IE 11 (2019) ----
      // Background: PreventDefault is not recognized in IE. In IE 11, a click
      // event will fire the following events:
      // MSPointerDown -> pointerdown -> MSPointerUp -> pointerup -> click
      // This exact same sequence of events happens whether the event originated
      // from a touch, a trackpad, or a mouse. mousedown, mouseup, and mousemove
      // events behave similarly. Because of this behavior, we can (and should)
      // remove the event handlers that are not specific to IE 11 as soon as an
      // IE 11 event is fired. This will prevent duplicate events from happening
      // such as double click.
      let IEEvents = [
        'pointerdown',
        'MSPointerDown',
        'pointermove',
        'MSPointerMove',
        'pointerup',
        'MSPointerUp'
      ];
      if (IEEvents.includes(touchEvent)) {
        unbindEvent('click');
      }

      handler.call(this, e);
    });
  }

  // Return function that unbinds all handlers
  return function() {
    unbindEvent('click');
    unbindEvent('touch');
  };
};

exports.addMouseDownTouchEvent = function(element, handler) {
  return addEvent(element, 'mousedown', handler);
};

exports.addMouseUpTouchEvent = function(
  element,
  handler,
  suppressTouchDefault = true
) {
  return addEvent(element, 'mouseup', handler, suppressTouchDefault);
};

exports.addMouseMoveTouchEvent = function(element, handler) {
  return addEvent(element, 'mousemove', handler);
};

exports.addClickTouchEvent = function(element, handler) {
  return addEvent(element, 'click', handler);
};

// A map from standard touch events to various aliases.
var TOUCH_MAP = {
  //  Incomplete list, add as needed.
  click: {
    standard: 'touchstart',
    ie10: 'MSPointerDown',
    ie11: 'pointerdown'
  },
  mousedown: {
    standard: 'touchstart',
    ie10: 'MSPointerDown',
    ie11: 'pointerdown'
  },
  mouseup: {
    standard: 'touchend',
    ie10: 'MSPointerUp',
    ie11: 'pointerup'
  },
  mousemove: {
    standard: 'touchmove',
    ie10: 'MSPointerMove',
    ie11: 'pointermove'
  }
};
exports.TOUCH_MAP = TOUCH_MAP;

exports.isMobile = function() {
  var reg = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/;
  return reg.test(window.navigator.userAgent);
};

exports.isWindowsTouch = function() {
  var reg = /MSIE.*Touch/;
  return reg.test(window.navigator.userAgent);
};

exports.isAndroid = function() {
  var reg = /Android/;
  return reg.test(window.navigator.userAgent);
};

exports.isIOS = function() {
  var reg = /iP(hone|od|ad)/;
  return reg.test(window.navigator.userAgent);
};

exports.isIPad = function() {
  var reg = /iPad/i;
  return reg.test(window.navigator.userAgent);
};
