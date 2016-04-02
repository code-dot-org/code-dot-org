/** @file Tests of App Lab event sanitization. */
'use strict';

var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
var EventSandboxer = require('@cdo/apps/applab/EventSandboxer');

describe('EventSandboxer', function () {
  var sandboxer;

  beforeEach(function () {
    sandboxer = new EventSandboxer();
  });

  it('can be constructed with no arguments', function () {
    assert.isDefined(sandboxer);
  });

  describe('sandboxing', function () {
    it('throws TypeError when sandboxing null or non-objects', function () {
      assert.throws(
          function () { sandboxer.sandboxEvent(undefined); },
          TypeError,
          'Failed to sandbox event: Expected an event object, but got undefined');
      assert.throws(
          function () { sandboxer.sandboxEvent(null); },
          TypeError,
          'Failed to sandbox event: Expected an event object, but got null');
      assert.throws(
          function () { sandboxer.sandboxEvent(NaN); },
          TypeError,
          'Failed to sandbox event: Expected an event object, but got NaN');
      assert.throws(
          function () { sandboxer.sandboxEvent('some string'); },
          TypeError,
          'Failed to sandbox event: Expected an event object, but got some string');
      assert.throws(
          function () { sandboxer.sandboxEvent(function () {}); },
          TypeError,
          'Failed to sandbox event: Expected an event object, but got function () {}');
    });

    it('creates a new object', function () {
      var originalEvent = {};
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      assert.deepEqual(originalEvent, newEvent);
      assert.notStrictEqual(originalEvent, newEvent);
    });

    function assertPreservesPropertyValue(name, value) {
      var originalEvent = {};
      originalEvent[name] = value;
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      assert.property(newEvent, name);
      assert.equal(newEvent[name], value);
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
      assert.notProperty(newEvent, name);
      assert.equal(newEvent[name], undefined);
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
        charCode: 65
      };
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      assert.property(newEvent, 'key');
      assert.equal(newEvent.key, 'A');
    });

    it('adds "key" property when keyCode is available', function () {
      var originalEvent = {
        keyCode: 65
      };
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      assert.property(newEvent, 'key');
      assert.equal(newEvent.key, 'a');
    });

    it('does not add "key" property when neither charCode nor keyCode are available', function () {
      var originalEvent = {};
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      assert.notProperty(newEvent, 'key');
      assert.equal(newEvent.key, undefined);
    });
  });

  describe('coordinate transformations', function () {
    function assertPropertyChange(propertyName, originalValue, newValue) {
      var originalEvent = {};
      originalEvent[propertyName] = originalValue;
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      assert.equal(newEvent[propertyName], newValue);
    }

    function assertNoPropertyChange(propertyName, originalValue) {
      var originalEvent = {};
      originalEvent[propertyName] = originalValue;
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      assert.equal(newEvent[propertyName], originalValue);
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
        movementY: 15
      };
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      assert.property(newEvent, 'movementX');
      assert.property(newEvent, 'movementY');
      assert.equal(newEvent.movementX, 10);
      assert.equal(newEvent.movementY, 15);
    });

    it('synthesizes "movementX/Y" properties when type is "mousemove"', function () {
      var originalEvent = {
        type: 'mousemove'
      };
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      assert.property(newEvent, 'movementX');
      assert.property(newEvent, 'movementY');
      assert.equal(newEvent.movementX, 0);
      assert.equal(newEvent.movementY, 0);
    });

    function makeMousemoveEvent(target, x, y) {
      return {
        type: 'mousemove',
        currentTarget: target,
        clientX: x,
        clientY: y
      };
    }

    function makeMouseoutEvent(target) {
      return {
        type: 'mouseout',
        currentTarget: target
      };
    }

    it('updates synthesized "movementX/Y" properties based on currentTarget.id and last clientX/Y', function () {
      var fakeTarget = {
        id: 'fakeTargetId'
      };

      var mousemoveA = makeMousemoveEvent(fakeTarget, 50, 50);
      var mousemoveB = makeMousemoveEvent(fakeTarget, 60, 50);
      var mousemoveC = makeMousemoveEvent(fakeTarget, 75, 30);

      var newMousemoveA = sandboxer.sandboxEvent(mousemoveA);
      assert.equal(newMousemoveA.movementX, 0);
      assert.equal(newMousemoveA.movementY, 0);

      var newMousemoveB = sandboxer.sandboxEvent(mousemoveB);
      assert.equal(newMousemoveB.movementX, 10);
      assert.equal(newMousemoveB.movementY, 0);

      var newMousemoveC = sandboxer.sandboxEvent(mousemoveC);
      assert.equal(newMousemoveC.movementX, 15);
      assert.equal(newMousemoveC.movementY, -20);
    });

    it('can clear history for synthesized movements for an element', function () {
      var fakeTarget = {
        id: 'fakeTargetId'
      };

      var mousemoveA = makeMousemoveEvent(fakeTarget, 50, 50);
      var mousemoveB = makeMousemoveEvent(fakeTarget, 60, 50);
      var mouseoutA = makeMouseoutEvent(fakeTarget);
      var mousemoveC = makeMousemoveEvent(fakeTarget, 75, 30);

      var newMousemoveA = sandboxer.sandboxEvent(mousemoveA);
      assert.equal(newMousemoveA.movementX, 0);
      assert.equal(newMousemoveA.movementY, 0);

      var newMousemoveB = sandboxer.sandboxEvent(mousemoveB);
      assert.equal(newMousemoveB.movementX, 10);
      assert.equal(newMousemoveB.movementY, 0);

      sandboxer.clearLastMouseMoveEvent(mouseoutA);

      var newMousemoveC = sandboxer.sandboxEvent(mousemoveC);
      assert.equal(newMousemoveC.movementX, 0);
      assert.equal(newMousemoveC.movementY, 0);
    });
  });

  describe('DOM element substitution', function () {
    function assertPropertyElementToElementId(originalName) {
      var randomId = Math.random();
      var originalEvent = {};
      originalEvent[originalName] = {
        id: randomId
      };
      var newEvent = sandboxer.sandboxEvent(originalEvent);
      assert.property(newEvent, originalName + 'Id');
      assert.equal(newEvent[originalName + 'Id'], randomId);
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
    function assertPropertyPolyfillsProperty(srcProperty, destProperty, eventType) {
      var randomIdA = Math.random();
      var randomIdB = Math.random();

      // If the source property is present and the destination property is not,
      // assert that the destination property gets the value of the source property.
      var originalEvent = {
        type: eventType
      };
      originalEvent[srcProperty] = {id: randomIdA};
      var polyfilledEvent = sandboxer.sandboxEvent(originalEvent);
      assert.property(polyfilledEvent, destProperty + 'Id');
      assert.equal(polyfilledEvent[destProperty + 'Id'], randomIdA);

      // If both properties are present, assert that the destination property
      // keeps its own value.
      originalEvent[destProperty] = {id: randomIdB};
      var nonPolyfilledEvent = sandboxer.sandboxEvent(originalEvent);
      assert.property(nonPolyfilledEvent, destProperty + 'Id');
      assert.equal(nonPolyfilledEvent[destProperty + 'Id'], randomIdB);
    }

    // It's valuable to check these paired properties together, to make sure
    // the right property gets assigned to the right destination property
    // depending on the event type.
    function assertPropertiesPolyfillToElementFromElement(toProperty, fromProperty, eventType) {
      var originalEvent = {
        type: eventType
      };

      // If the source properties are present and the destination properties are
      // not, assert that the destination properties get the values of the
      // source properties.
      var toId = 'id of ' + toProperty;
      var fromId = 'id of ' + fromProperty;
      originalEvent[toProperty] = {id: toId};
      originalEvent[fromProperty] = {id: fromId};
      var polyfilledEvent = sandboxer.sandboxEvent(originalEvent);
      assert.property(polyfilledEvent, 'toElementId');
      assert.equal(polyfilledEvent.toElementId, toId, 'toElementId gets value from ' + toProperty);
      assert.property(polyfilledEvent, 'fromElementId');
      assert.equal(polyfilledEvent.fromElementId, fromId, 'fromElementId gets value from ' + fromProperty);

      // If both properties are present, assert that the destination properties
      // keeps their own values.
      var providedToId = 'id of toElement';
      var providedFromId = 'id of fromElement';
      originalEvent.toElement = {id: providedToId};
      originalEvent.fromElement = {id: providedFromId};
      var nonPolyfilledEvent = sandboxer.sandboxEvent(originalEvent);
      assert.property(nonPolyfilledEvent, 'toElementId');
      assert.equal(nonPolyfilledEvent.toElementId, providedToId, 'toElementId keeps its value');
      assert.property(nonPolyfilledEvent, 'fromElementId');
      assert.equal(nonPolyfilledEvent.fromElementId, providedFromId, 'fromElementId keeps its value');
    }

    it('polyfills target->srcElement', function () {
      assertPropertyPolyfillsProperty('target', 'srcElement');
    });

    it('polyfills target->toElement and relatedTarget->fromElement on focusin event', function () {
      assertPropertyPolyfillsProperty('target', 'toElement', 'focusin');
      assertPropertyPolyfillsProperty('relatedTarget', 'fromElement', 'focusin');
      assertPropertiesPolyfillToElementFromElement('target', 'relatedTarget', 'focusin');
    });

    it('polyfills relatedTarget->toElement and target->fromElement on focusout event', function () {
      assertPropertyPolyfillsProperty('relatedTarget', 'toElement', 'focusout');
      assertPropertyPolyfillsProperty('target', 'fromElement', 'focusout');
      assertPropertiesPolyfillToElementFromElement('relatedTarget', 'target', 'focusout');
    });

    it('polyfills target->toElement and relatedTarget->fromElement on mouseenter event', function () {
      assertPropertyPolyfillsProperty('target', 'toElement', 'mouseenter');
      assertPropertyPolyfillsProperty('relatedTarget', 'fromElement', 'mouseenter');
      assertPropertiesPolyfillToElementFromElement('target', 'relatedTarget', 'mouseenter');
    });

    it('polyfills relatedTarget->toElement and target->fromElement on mouseleave event', function () {
      assertPropertyPolyfillsProperty('relatedTarget', 'toElement', 'mouseleave');
      assertPropertyPolyfillsProperty('target', 'fromElement', 'mouseleave');
      assertPropertiesPolyfillToElementFromElement('relatedTarget', 'target', 'mouseleave');
    });

    it('polyfills target->toElement and relatedTarget->fromElement on mouseover event', function () {
      assertPropertyPolyfillsProperty('target', 'toElement', 'mouseover');
      assertPropertyPolyfillsProperty('relatedTarget', 'fromElement', 'mouseover');
      assertPropertiesPolyfillToElementFromElement('target', 'relatedTarget', 'mouseover');
    });

    it('polyfills relatedTarget->toElement and target->fromElement on mouseout event', function () {
      assertPropertyPolyfillsProperty('relatedTarget', 'toElement', 'mouseout');
      assertPropertyPolyfillsProperty('target', 'fromElement', 'mouseout');
      assertPropertiesPolyfillToElementFromElement('relatedTarget', 'target', 'mouseout');
    });

    it('polyfills target->toElement and relatedTarget->fromElement on dragenter event', function () {
      assertPropertyPolyfillsProperty('target', 'toElement', 'dragenter');
      assertPropertyPolyfillsProperty('relatedTarget', 'fromElement', 'dragenter');
      assertPropertiesPolyfillToElementFromElement('target', 'relatedTarget', 'dragenter');
    });

    it('polyfills relatedTarget->toElement and target->fromElement on dragexit event', function () {
      assertPropertyPolyfillsProperty('relatedTarget', 'toElement', 'dragexit');
      assertPropertyPolyfillsProperty('target', 'fromElement', 'dragexit');
      assertPropertiesPolyfillToElementFromElement('relatedTarget', 'target', 'dragexit');
    });
  });
});
