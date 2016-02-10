/** @file Tests of App Lab event sanitization. */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */
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

    it('does not preserve "near"', function () {
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
});
