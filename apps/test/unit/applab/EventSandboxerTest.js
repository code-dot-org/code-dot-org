/** @file Tests of App Lab event sanitization. */

var EventSandboxer = require('@cdo/apps/applab/EventSandboxer');

describe('EventSandboxer', function () {
  var sandboxer;

  beforeEach(function () {
    sandboxer = new EventSandboxer();
  });

  it('can be constructed with no arguments', function () {
    expect(sandboxer).toBeDefined();
  });

  describe('sandboxing', function () {
    it('throws TypeError when sandboxing null or non-objects', function () {
      expect(function () {
        sandboxer.sandboxEvent(undefined);
      }).toThrow();
      expect(function () {
        sandboxer.sandboxEvent(null);
      }).toThrow();
      expect(function () {
        sandboxer.sandboxEvent(NaN);
      }).toThrow();
      expect(function () {
        sandboxer.sandboxEvent('some string');
      }).toThrow();
      expect(function () {
        sandboxer.sandboxEvent(function () {});
      }).toThrow();
    });

    it('creates a new object', function () {
      var originalEvent = {};
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      expect(originalEvent).toEqual(newEvent);
      expect(originalEvent).not.toBe(newEvent);
    });

    function assertPreservesPropertyValue(name, value) {
      var originalEvent = {};
      originalEvent[name] = value;
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      expect(name in newEvent).toBeTruthy();
      expect(newEvent[name]).toEqual(value);
    }

    it('preserves "altKey"', function () {
      assertPreservesPropertyValue('altKey', true);
    });

    it('preserves "button"', function () {
      assertPreservesPropertyValue('button', 2);
    });

    it('preserves "charCode"', function () {
      assertPreservesPropertyValue('charCode', 65);
    });

    it('preserves "ctrlKey"', function () {
      assertPreservesPropertyValue('ctrlKey', true);
    });

    it('preserves "keyCode"', function () {
      assertPreservesPropertyValue('keyCode', 65);
    });

    it('preserves "keyIdentifier"', function () {
      assertPreservesPropertyValue('keyIdentifier', 'A');
    });

    it('preserves "keyLocation"', function () {
      assertPreservesPropertyValue('keyLocation', 3);
    });

    it('preserves "location"', function () {
      assertPreservesPropertyValue('location', 3);
    });

    it('preserves "metaKey"', function () {
      assertPreservesPropertyValue('metaKey', true);
    });

    it('preserves "offsetX"', function () {
      assertPreservesPropertyValue('offsetX', 150);
    });

    it('preserves "offsetY"', function () {
      assertPreservesPropertyValue('offsetY', 150);
    });

    it('preserves "repeat"', function () {
      assertPreservesPropertyValue('repeat', true);
    });

    it('preserves "shiftKey"', function () {
      assertPreservesPropertyValue('shiftKey', true);
    });

    it('preserves "type"', function () {
      assertPreservesPropertyValue('type', 'mousedown');
    });

    it('preserves "which"', function () {
      assertPreservesPropertyValue('which', 65);
    });

    it('preserves "clientX"', function () {
      assertPreservesPropertyValue('clientX', 150);
    });

    it('preserves "pageX"', function () {
      assertPreservesPropertyValue('pageX', 150);
    });

    it('preserves "x"', function () {
      assertPreservesPropertyValue('x', 150);
    });

    it('preserves "clientY"', function () {
      assertPreservesPropertyValue('clientY', 150);
    });

    it('preserves "pageY"', function () {
      assertPreservesPropertyValue('pageY', 150);
    });

    it('preserves "y"', function () {
      assertPreservesPropertyValue('y', 150);
    });

    function assertDoesNotPreservePropertyValue(name, value) {
      var originalEvent = {};
      originalEvent[name] = value;
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      expect(name in newEvent).toBeFalsy();
      expect(newEvent[name]).toEqual(undefined);
    }

    it('does not preserve undefined properties', function () {
      assertDoesNotPreservePropertyValue('keyCode', undefined);
    });

    it('does not preserve "movementX" if missing "movementY', function () {
      assertDoesNotPreservePropertyValue('movementX', 10);
    });

    it('does not preserve "movementY" if missing "movementX"', function () {
      assertDoesNotPreservePropertyValue('movementY', 15);
    });

    it('does not preserve unsupported properties like "near"', function () {
      // Who knows, we might support this in the future -
      // it's an experimental technology.  For now it's a good
      // example of a nonstandard property we don't support.
      // see https://developer.mozilla.org/en-US/docs/Web/API/UserProximityEvent
      assertDoesNotPreservePropertyValue('near', true);
    });

    it('adds "key" property when charCode is available', function () {
      var originalEvent = {
        charCode: 65,
      };
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      expect('key' in newEvent).toBeTruthy();
      expect(newEvent.key).toEqual('A');
    });

    it('adds "key" property when keyCode is available', function () {
      var originalEvent = {
        keyCode: 65,
      };
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      expect('key' in newEvent).toBeTruthy();
      expect(newEvent.key).toEqual('a');
    });

    it('does not add "key" property when neither charCode nor keyCode are available', function () {
      var originalEvent = {};
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      expect('key' in newEvent).toBeFalsy();
      expect(newEvent.key).toEqual(undefined);
    });
  });

  describe('coordinate transformations', function () {
    function assertPropertyChange(propertyName, originalValue, newValue) {
      var originalEvent = {};
      originalEvent[propertyName] = originalValue;
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      expect(newEvent[propertyName]).toEqual(newValue);
    }

    function assertNoPropertyChange(propertyName, originalValue) {
      var originalEvent = {};
      originalEvent[propertyName] = originalValue;
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      expect(newEvent[propertyName]).toEqual(originalValue);
    }

    it('applies inverse xOffset_ to "clientX" property', function () {
      sandboxer.xOffset_ = 10;
      assertPropertyChange('clientX', 50, 40);
    });

    it('applies inverse xOffset_ to "pageX" property', function () {
      sandboxer.xOffset_ = 20;
      assertPropertyChange('pageX', 50, 30);
    });

    it('applies inverse xOffset_ to "x" property', function () {
      sandboxer.xOffset_ = -10;
      assertPropertyChange('x', 50, 60);
    });

    it('does not apply xOffset_ to "offsetX" property', function () {
      sandboxer.xOffset_ = -10;
      assertNoPropertyChange('offsetX', 50);
    });

    it('applies inverse yOffset_ to "clientY" property', function () {
      sandboxer.yOffset_ = 10;
      assertPropertyChange('clientY', 50, 40);
    });

    it('applies inverse yOffset_ to "pageY" property', function () {
      sandboxer.yOffset_ = 20;
      assertPropertyChange('pageY', 50, 30);
    });

    it('applies inverse yOffset_ to "y" property', function () {
      sandboxer.yOffset_ = -10;
      assertPropertyChange('y', 50, 60);
    });

    it('does not apply yOffset_ to "offsetY" property', function () {
      sandboxer.yOffset_ = -10;
      assertNoPropertyChange('offsetY', 50);
    });

    it('applies inverse xScale_ to "clientX" property', function () {
      sandboxer.xScale_ = 1.25;
      assertPropertyChange('clientX', 50, 40);
    });

    it('applies inverse xScale_ to "pageX" property', function () {
      sandboxer.xScale_ = 2;
      assertPropertyChange('pageX', 50, 25);
    });

    it('applies inverse xScale_ to "x" property', function () {
      sandboxer.xScale_ = 0.5;
      assertPropertyChange('x', 50, 100);
    });

    it('does not apply xScale_ to "offsetX" property', function () {
      sandboxer.xScale_ = 3;
      assertNoPropertyChange('offsetX', 50);
    });

    it('applies inverse yScale_ to "clientY" property', function () {
      sandboxer.yScale_ = 1.25;
      assertPropertyChange('clientY', 50, 40);
    });

    it('applies inverse yScale_ to "pageY" property', function () {
      sandboxer.yScale_ = 2;
      assertPropertyChange('pageY', 50, 25);
    });

    it('applies inverse yScale_ to "y" property', function () {
      sandboxer.yScale_ = 0.5;
      assertPropertyChange('y', 50, 100);
    });

    it('does not apply yScale_ to "offsetY" property', function () {
      sandboxer.yScale_ = 3;
      assertNoPropertyChange('offsetY', 50);
    });

    it('applies xOffset_ before xScale_', function () {
      sandboxer.xOffset_ = 10;
      sandboxer.xScale_ = 0.5;
      assertPropertyChange('clientX', 50, 80);
    });

    it('applies yOffset_ before yScale_', function () {
      sandboxer.yOffset_ = 5;
      sandboxer.yScale_ = 0.1;
      assertPropertyChange('clientY', 50, 450);
    });
  });

  describe('movementX/Y synthesis', function () {
    it('preserves "movementX" and "movementY" if they are both provided', function () {
      var originalEvent = {
        movementX: 10,
        movementY: 15,
      };
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      expect('movementX' in newEvent).toBeTruthy();
      expect('movementY' in newEvent).toBeTruthy();
      expect(newEvent.movementX).toEqual(10);
      expect(newEvent.movementY).toEqual(15);
    });

    it('synthesizes "movementX/Y" properties when type is "mousemove"', function () {
      var originalEvent = {
        type: 'mousemove',
      };
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      expect('movementX' in newEvent).toBeTruthy();
      expect('movementY' in newEvent).toBeTruthy();
      expect(newEvent.movementX).toEqual(0);
      expect(newEvent.movementY).toEqual(0);
    });

    function makeMousemoveEvent(target, x, y) {
      return {
        type: 'mousemove',
        currentTarget: target,
        clientX: x,
        clientY: y,
      };
    }

    function makeMouseoutEvent(target) {
      return {
        type: 'mouseout',
        currentTarget: target,
      };
    }

    it('updates synthesized "movementX/Y" properties based on currentTarget.id and last clientX/Y', function () {
      var fakeTarget = {
        id: 'fakeTargetId',
      };

      var mousemoveA = makeMousemoveEvent(fakeTarget, 50, 50);
      var mousemoveB = makeMousemoveEvent(fakeTarget, 60, 50);
      var mousemoveC = makeMousemoveEvent(fakeTarget, 75, 30);

      var newMousemoveA = sandboxer.sandboxEvent(mousemoveA);
      expect(newMousemoveA.movementX).toEqual(0);
      expect(newMousemoveA.movementY).toEqual(0);

      var newMousemoveB = sandboxer.sandboxEvent(mousemoveB);
      expect(newMousemoveB.movementX).toEqual(10);
      expect(newMousemoveB.movementY).toEqual(0);

      var newMousemoveC = sandboxer.sandboxEvent(mousemoveC);
      expect(newMousemoveC.movementX).toEqual(15);
      expect(newMousemoveC.movementY).toEqual(-20);
    });

    it('can clear history for synthesized movements for an element', function () {
      var fakeTarget = {
        id: 'fakeTargetId',
      };

      var mousemoveA = makeMousemoveEvent(fakeTarget, 50, 50);
      var mousemoveB = makeMousemoveEvent(fakeTarget, 60, 50);
      var mouseoutA = makeMouseoutEvent(fakeTarget);
      var mousemoveC = makeMousemoveEvent(fakeTarget, 75, 30);

      var newMousemoveA = sandboxer.sandboxEvent(mousemoveA);
      expect(newMousemoveA.movementX).toEqual(0);
      expect(newMousemoveA.movementY).toEqual(0);

      var newMousemoveB = sandboxer.sandboxEvent(mousemoveB);
      expect(newMousemoveB.movementX).toEqual(10);
      expect(newMousemoveB.movementY).toEqual(0);

      sandboxer.clearLastMouseMoveEvent(mouseoutA);

      var newMousemoveC = sandboxer.sandboxEvent(mousemoveC);
      expect(newMousemoveC.movementX).toEqual(0);
      expect(newMousemoveC.movementY).toEqual(0);
    });
  });

  describe('hoisted event target properties', () => {
    it('copies "selectionStart" from the original event target to the new event', () => {
      const originalEvent = {
        target: {tagName: 'TEXTAREA', selectionStart: Math.random()},
      };
      const newEvent = sandboxer.sandboxEvent(originalEvent);
      expect(newEvent.selectionStart).toEqual(
        originalEvent.target.selectionStart
      );
    });

    it('copies "selectionEnd" from the original event target to the new event', () => {
      const originalEvent = {
        target: {tagName: 'TEXTAREA', selectionEnd: Math.random()},
      };
      const newEvent = sandboxer.sandboxEvent(originalEvent);
      expect(newEvent.selectionEnd).toEqual(originalEvent.target.selectionEnd);
    });

    it('copies "selectionStart" from the original event target to the new event if the target is the text type of INPUT', () => {
      const originalEvent = {
        target: {tagName: 'INPUT', type: 'text', selectionStart: Math.random()},
      };
      const newEvent = sandboxer.sandboxEvent(originalEvent);
      expect(newEvent.selectionStart).toEqual(
        originalEvent.target.selectionStart
      );
    });

    it('copies "selectionEnd" from the original event target to the new event', () => {
      const originalEvent = {
        target: {tagName: 'TEXTAREA', selectionEnd: Math.random()},
      };
      const newEvent = sandboxer.sandboxEvent(originalEvent);
      expect(newEvent.selectionEnd).toEqual(originalEvent.target.selectionEnd);
    });

    it('does not add selectionStart or selectionEnd to the new event if they are missing or undefined', () => {
      const originalEvent = {
        target: {tagName: 'TEXTAREA', selectionEnd: undefined},
      };
      const newEvent = sandboxer.sandboxEvent(originalEvent);
      expect(
        Object.prototype.hasOwnProperty.call(newEvent, 'selectionStart')
      ).toBe(false);
      expect(
        Object.prototype.hasOwnProperty.call(newEvent, 'selectionEnd')
      ).toBe(false);
    });

    it('does not add selectionStart or selectionEnd to the new event if the target is the range type of INPUT', () => {
      const originalEvent = {
        target: {
          tagName: 'INPUT',
          type: 'range',
          selectionStart: 3,
          selectionEnd: 3,
        },
      };
      const newEvent = sandboxer.sandboxEvent(originalEvent);
      expect(
        Object.prototype.hasOwnProperty.call(newEvent, 'selectionStart')
      ).toBe(false);
      expect(
        Object.prototype.hasOwnProperty.call(newEvent, 'selectionEnd')
      ).toBe(false);
    });
  });

  describe('DOM element substitution', function () {
    function assertPropertyElementToElementId(originalName) {
      var randomId = Math.random();
      var originalEvent = {};
      originalEvent[originalName] = {
        id: randomId,
      };
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      expect(originalName + 'Id' in newEvent).toBeTruthy();
      expect(newEvent[originalName + 'Id']).toEqual(randomId);
    }

    it('replaces the "fromElement" element property with the "fromElementId" property', function () {
      assertPropertyElementToElementId('fromElement');
    });

    it('replaces the "srcElement" element property with the "srcElementId" property', function () {
      assertPropertyElementToElementId('srcElement');
    });

    it('replaces the "currentTarget" element property with the "currentTargetId" property', function () {
      assertPropertyElementToElementId('currentTarget');
    });

    it('replaces the "relatedTarget" element property with the "relatedTargetId" property', function () {
      assertPropertyElementToElementId('relatedTarget');
    });

    it('replaces the "target" element property with the "targetId" property', function () {
      assertPropertyElementToElementId('target');
    });

    it('replaces the "toElement" element property with the "toElementId" property', function () {
      assertPropertyElementToElementId('toElement');
    });
  });

  describe('DOM element reference polyfills', function () {
    function assertPropertyPolyfillsProperty(
      srcProperty,
      destProperty,
      eventType
    ) {
      var randomIdA = Math.random();
      var randomIdB = Math.random();

      // If the source property is present and the destination property is not,
      // assert that the destination property gets the value of the source property.
      var originalEvent = {
        type: eventType,
      };
      originalEvent[srcProperty] = {id: randomIdA};
      var polyfilledEvent = sandboxer.sandboxEvent(originalEvent);
      expect(destProperty + 'Id' in polyfilledEvent).toBeTruthy();
      expect(polyfilledEvent[destProperty + 'Id']).toEqual(randomIdA);

      // If both properties are present, assert that the destination property
      // keeps its own value.
      originalEvent[destProperty] = {id: randomIdB};
      var nonPolyfilledEvent = sandboxer.sandboxEvent(originalEvent);
      expect(destProperty + 'Id' in nonPolyfilledEvent).toBeTruthy();
      expect(nonPolyfilledEvent[destProperty + 'Id']).toEqual(randomIdB);
    }

    // It's valuable to check these paired properties together, to make sure
    // the right property gets assigned to the right destination property
    // depending on the event type.
    function assertPropertiesPolyfillToElementFromElement(
      toProperty,
      fromProperty,
      eventType
    ) {
      var originalEvent = {
        type: eventType,
      };

      // If the source properties are present and the destination properties are
      // not, assert that the destination properties get the values of the
      // source properties.
      var toId = 'id of ' + toProperty;
      var fromId = 'id of ' + fromProperty;
      originalEvent[toProperty] = {id: toId};
      originalEvent[fromProperty] = {id: fromId};
      var polyfilledEvent = sandboxer.sandboxEvent(originalEvent);
      expect('toElementId' in polyfilledEvent).toBeTruthy();
      expect(polyfilledEvent.toElementId).toEqual(toId);
      expect('fromElementId' in polyfilledEvent).toBeTruthy();
      expect(polyfilledEvent.fromElementId).toEqual(fromId);

      // If both properties are present, assert that the destination properties
      // keeps their own values.
      var providedToId = 'id of toElement';
      var providedFromId = 'id of fromElement';
      originalEvent.toElement = {id: providedToId};
      originalEvent.fromElement = {id: providedFromId};
      var nonPolyfilledEvent = sandboxer.sandboxEvent(originalEvent);
      expect('toElementId' in nonPolyfilledEvent).toBeTruthy();
      expect(nonPolyfilledEvent.toElementId).toEqual(providedToId);
      expect('fromElementId' in nonPolyfilledEvent).toBeTruthy();
      expect(nonPolyfilledEvent.fromElementId).toEqual(providedFromId);
    }

    it('polyfills target->srcElement', function () {
      assertPropertyPolyfillsProperty('target', 'srcElement');
    });

    it('polyfills target->toElement and relatedTarget->fromElement on focusin event', function () {
      assertPropertyPolyfillsProperty('target', 'toElement', 'focusin');
      assertPropertyPolyfillsProperty(
        'relatedTarget',
        'fromElement',
        'focusin'
      );
      assertPropertiesPolyfillToElementFromElement(
        'target',
        'relatedTarget',
        'focusin'
      );
    });

    it('polyfills relatedTarget->toElement and target->fromElement on focusout event', function () {
      assertPropertyPolyfillsProperty('relatedTarget', 'toElement', 'focusout');
      assertPropertyPolyfillsProperty('target', 'fromElement', 'focusout');
      assertPropertiesPolyfillToElementFromElement(
        'relatedTarget',
        'target',
        'focusout'
      );
    });

    it('polyfills target->toElement and relatedTarget->fromElement on mouseenter event', function () {
      assertPropertyPolyfillsProperty('target', 'toElement', 'mouseenter');
      assertPropertyPolyfillsProperty(
        'relatedTarget',
        'fromElement',
        'mouseenter'
      );
      assertPropertiesPolyfillToElementFromElement(
        'target',
        'relatedTarget',
        'mouseenter'
      );
    });

    it('polyfills relatedTarget->toElement and target->fromElement on mouseleave event', function () {
      assertPropertyPolyfillsProperty(
        'relatedTarget',
        'toElement',
        'mouseleave'
      );
      assertPropertyPolyfillsProperty('target', 'fromElement', 'mouseleave');
      assertPropertiesPolyfillToElementFromElement(
        'relatedTarget',
        'target',
        'mouseleave'
      );
    });

    it('polyfills target->toElement and relatedTarget->fromElement on mouseover event', function () {
      assertPropertyPolyfillsProperty('target', 'toElement', 'mouseover');
      assertPropertyPolyfillsProperty(
        'relatedTarget',
        'fromElement',
        'mouseover'
      );
      assertPropertiesPolyfillToElementFromElement(
        'target',
        'relatedTarget',
        'mouseover'
      );
    });

    it('polyfills relatedTarget->toElement and target->fromElement on mouseout event', function () {
      assertPropertyPolyfillsProperty('relatedTarget', 'toElement', 'mouseout');
      assertPropertyPolyfillsProperty('target', 'fromElement', 'mouseout');
      assertPropertiesPolyfillToElementFromElement(
        'relatedTarget',
        'target',
        'mouseout'
      );
    });

    it('polyfills target->toElement and relatedTarget->fromElement on dragenter event', function () {
      assertPropertyPolyfillsProperty('target', 'toElement', 'dragenter');
      assertPropertyPolyfillsProperty(
        'relatedTarget',
        'fromElement',
        'dragenter'
      );
      assertPropertiesPolyfillToElementFromElement(
        'target',
        'relatedTarget',
        'dragenter'
      );
    });

    it('polyfills relatedTarget->toElement and target->fromElement on dragexit event', function () {
      assertPropertyPolyfillsProperty('relatedTarget', 'toElement', 'dragexit');
      assertPropertyPolyfillsProperty('target', 'fromElement', 'dragexit');
      assertPropertiesPolyfillToElementFromElement(
        'relatedTarget',
        'target',
        'dragexit'
      );
    });
  });
});
