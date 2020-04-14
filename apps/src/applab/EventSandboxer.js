/** @file Helper that generates sanitized, standardized event objects. */
import keyEvent from './keyEvent';

/**
 * Helper that generates sanitized, standardized event objects.
 *
 * Primary responsibilities include:
 * - Allowing only a subset of properties through to sandboxed events
 * - Replacing DOM references with string element IDs for security
 * - Transforming screen coordinates to the app coordinate system
 * - Polyfill movementX and movementY properties on mouse events
 *
 * @constructor
 * @example
 *   var sandboxer = new EventSandboxer();
 *   function onClick(e) {
 *     studentClickHandler(sandboxer.sandboxEvent(e));
 *   }
 */
export default function EventSandboxer() {
  /** @private {number} */
  this.xScale_ = 1;

  /** @private {number} */
  this.yScale_ = 1;

  /** @private {number} */
  this.xOffset_ = 0;

  /** @private {number} */
  this.yOffset_ = 0;

  /**
   * @private {Object} map from element id to the last mousemove event which
   * occurred on that element. This is used to simulate movementX and movementY
   * for browsers which do not support it natively.
   */
  this.lastMouseMoveEventMap_ = {};
}

/**
 * Updates the sandboxer's internal transform according to the position and
 * scale of the provided div (which should be the app/play space) so that it
 * can accurately transform mouse coordinates into app space.
 * @param {HTMLElement} element
 */
EventSandboxer.prototype.setTransformFromElement = function(element) {
  // Capture div scale
  this.xScale_ = element.getBoundingClientRect().width / element.offsetWidth;
  this.yScale_ = element.getBoundingClientRect().height / element.offsetHeight;

  // Capture div offset, and all of its parent offsets, together
  var xOffset = 0;
  var yOffset = 0;
  while (element) {
    xOffset += element.offsetLeft;
    yOffset += element.offsetTop;
    element = element.offsetParent;
  }
  this.xOffset_ = xOffset;
  this.yOffset_ = yOffset;
};

/**
 * Given a browser event, generates a new event-like object suitable for use
 * in student code.
 * @param {!Event} event - the original browser event
 * @returns {Object} new event-like object
 * @throws {TypeError} if event is null or not an object
 */
EventSandboxer.prototype.sandboxEvent = function(event) {
  if (event === null || typeof event !== 'object') {
    throw new TypeError(
      'Failed to sandbox event: Expected an event object, but got ' + event
    );
  }

  // Calculate and assign any relevant values here, and then return it at the end.
  var newEvent = {};

  // Pass these properties through to applabEvent:
  [
    'altKey',
    'button',
    'charCode',
    'ctrlKey',
    'keyCode',
    'keyIdentifier',
    'keyLocation',
    'location',
    'metaKey',
    'offsetX',
    'offsetY',
    'repeat',
    'shiftKey',
    'type',
    'which'
  ].forEach(function(prop) {
    if (typeof event[prop] !== 'undefined') {
      newEvent[prop] = event[prop];
    }
  });

  // This "mouse" event will come either from a normal input, or from the first
  // of multiple touches.
  let mouseEvent;

  const touchEvents = {
    touchstart: 'mousedown',
    touchmove: 'mousemove',
    touchend: 'mouseup'
  };

  if (touchEvents[event.type]) {
    newEvent.type = touchEvents[event.type];
    mouseEvent = event.changedTouches[0];

    // Calculate and assign values that can be missing when touch is used.
    // We treat mouseEvent as read-only, so we will go ahead and write these
    // to the desired destination: newEvent.
    if (mouseEvent.x === undefined) {
      newEvent.x = (mouseEvent.clientX - this.xOffset_) / this.xScale_;
    }
    if (mouseEvent.y === undefined) {
      newEvent.y = (mouseEvent.clientY - this.yOffset_) / this.yScale_;
    }
  } else {
    mouseEvent = event;
  }

  // Convert x coordinates and then pass through to applabEvent:
  ['clientX', 'pageX', 'x'].forEach(function(prop) {
    if (typeof mouseEvent[prop] !== 'undefined') {
      newEvent[prop] = (mouseEvent[prop] - this.xOffset_) / this.xScale_;
    }
  }, this);
  // Convert y coordinates and then pass through to applabEvent:
  ['clientY', 'pageY', 'y'].forEach(function(prop) {
    if (typeof mouseEvent[prop] !== 'undefined') {
      newEvent[prop] = (mouseEvent[prop] - this.yOffset_) / this.yScale_;
    }
  }, this);

  // Set movementX and movementY, computing it from clientX and clientY if necessary.
  // The element must have an element id for this to work.
  if (
    typeof mouseEvent.movementX !== 'undefined' &&
    typeof mouseEvent.movementY !== 'undefined'
  ) {
    // The browser supports movementX and movementY natively.
    newEvent.movementX = mouseEvent.movementX;
    newEvent.movementY = mouseEvent.movementY;
  } else if (newEvent.type === 'mousemove') {
    var currentTargetId = event.currentTarget && event.currentTarget.id;
    var lastEvent = this.lastMouseMoveEventMap_[currentTargetId];
    if (currentTargetId && lastEvent) {
      // Compute movementX and movementY from clientX and clientY.
      newEvent.movementX = mouseEvent.clientX - lastEvent.clientX;
      newEvent.movementY = mouseEvent.clientY - lastEvent.clientY;
    } else {
      // There has been no mousemove event on this element since the most recent
      // mouseout event, or this element does not have an element id.
      newEvent.movementX = 0;
      newEvent.movementY = 0;
    }
    if (currentTargetId) {
      this.lastMouseMoveEventMap_[currentTargetId] = mouseEvent;
    }
  }
  // Replace DOM elements with IDs and then add them to applabEvent:
  [
    'fromElement',
    'srcElement',
    'currentTarget',
    'relatedTarget',
    'target',
    'toElement'
  ].forEach(function(prop) {
    if (event[prop]) {
      newEvent[prop + 'Id'] = event[prop].id;
    }
  });

  // Pull selectionStart and selectionEnd from the target element, if available,
  // and expose them on the sandboxed event object. (Safari will throw if we
  // we ask for these properties on elements that aren't a TEXTAREA or these
  // 5 INPUT types)
  if (
    event.target &&
    ((event.target.tagName === 'INPUT' &&
      (event.target.type === 'text' ||
        event.target.type === 'search' ||
        event.target.type === 'password' ||
        event.target.type === 'url' ||
        event.target.type === 'tel')) ||
      event.target.tagName === 'TEXTAREA')
  ) {
    ['selectionStart', 'selectionEnd'].forEach(eventTargetPropName => {
      if (event.target[eventTargetPropName] !== undefined) {
        newEvent[eventTargetPropName] = event.target[eventTargetPropName];
      }
    });
  }

  // Attempt to polyfill DOM element ID properties
  // Of our six DOM properties, only three are standard.
  var fillProperty = function(to, from) {
    if (newEvent[from] !== undefined && newEvent[to] === undefined) {
      newEvent[to] = newEvent[from];
    }
  };

  // srcElement is an alias of target
  // https://developer.mozilla.org/en-US/docs/Web/API/Event/srcElement
  fillProperty('srcElementId', 'targetId');

  // fromElement and toElement can be filled from target and relatedTarget,
  // but the mapping depends on what type of event it is.
  // fromElement: https://msdn.microsoft.com/en-us/library/ms533773(v=vs.85).aspx
  // toElement: https://msdn.microsoft.com/en-us/library/ms534684(v=vs.85).aspx
  // mapping: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/relatedTarget
  if (
    ['focusin', 'mouseenter', 'mouseover', 'dragenter'].indexOf(event.type) !==
    -1
  ) {
    fillProperty('toElementId', 'targetId');
    fillProperty('fromElementId', 'relatedTargetId');
  } else if (
    ['focusout', 'mouseleave', 'mouseout', 'dragexit'].indexOf(event.type) !==
    -1
  ) {
    fillProperty('toElementId', 'relatedTargetId');
    fillProperty('fromElementId', 'targetId');
  }

  // Attempt to populate key property (not yet supported in Chrome/Safari):
  //
  // keyup/down has no charCode and can be translated with the keyEvent[] map
  // keypress can use charCode
  //
  var keyProp = event.charCode
    ? String.fromCharCode(event.charCode)
    : keyEvent[event.keyCode];
  if (typeof keyProp !== 'undefined') {
    newEvent.key = keyProp;
  }

  return newEvent;
};

/**
 * Remove an element from the mouse move event map, given an event on that
 * element (typically mouseout)
 * @param {Event} event
 */
EventSandboxer.prototype.clearLastMouseMoveEvent = function(event) {
  var elementId = event.currentTarget && event.currentTarget.id;
  if (
    elementId &&
    typeof this.lastMouseMoveEventMap_[elementId] !== 'undefined'
  ) {
    delete this.lastMouseMoveEventMap_[elementId];
  }
};
