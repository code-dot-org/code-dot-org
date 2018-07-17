import React from 'react';
import $ from 'jquery';
import sinon from 'sinon';
import {format} from 'util';
const project = require('@cdo/apps/code-studio/initApp/project');
const assets = require('@cdo/apps/code-studio/assets');
import i18n from '@cdo/apps/code-studio/i18n';

export function setExternalGlobals(beforeFunc=before, afterFunc=after) {
  // Temporary: Provide React on window while we still have a direct dependency
  // on the global due to a bad code-studio/apps interaction.
  window.React = React;
  window.dashboard = {...window.dashboard, i18n, assets, project};

  beforeFunc(() => {
    sinon.stub(i18n, 't').callsFake((selector) => selector);

    sinon.stub(project, 'clearHtml');
    sinon.stub(project, 'exceedsAbuseThreshold').returns(false);
    sinon.stub(project, 'hasPrivacyProfanityViolation').returns(false);
    sinon.stub(project, 'getCurrentId').returns('fake_id');
    sinon.stub(project, 'isEditing').returns(true);
    sinon.stub(project, 'useMakerAPIs').returns(false);

    sinon.stub(assets.listStore, 'reset');
    sinon.stub(assets.listStore, 'add').returns([]);
    sinon.stub(assets.listStore, 'remove').returns([]);
    sinon.stub(assets.listStore, 'list').returns([]);
  });
  afterFunc(() => {
    i18n.t.restore();

    project.clearHtml.restore();
    project.exceedsAbuseThreshold.restore();
    project.hasPrivacyProfanityViolation.restore();
    project.getCurrentId.restore();
    project.isEditing.restore();
    project.useMakerAPIs.restore();

    assets.listStore.reset.restore();
    assets.listStore.add.restore();
    assets.listStore.remove.restore();
    assets.listStore.list.restore();
  });

  window.marked = function (str) {
    return str;
  };
  window.trackEvent = () => {};
}

/**
 * Generates an artist answer (which is just an ordered list of artist commands)
 * when given a function simulating the generated code. That function will
 * look something like the following:
 * function (api) {
 *   api.moveForward(100);
 *   api.turnRight(90);
 * }
 */
export function generateArtistAnswer(generatedCode) {
  var ArtistAPI = require('@cdo/apps/turtle/api');
  var api = new ArtistAPI();

  api.log = [];
  generatedCode(api);
  return api.log;
}

/**
 * @returns {boolean} True if mochify was launched with debug flag
 */
export function debugMode() {
  return location.search.substring(1).split('&').indexOf('debug') !== -1;
}

/**
 * jQuery.simulate was having issues in phantom, so I decided to roll my own
 * drag simulation.
 * @param {string} type ElementType to be dragged in
 * @param {number} left Horizontal offset from top left of visualization to drop at
 * @param {number} top Vertical offset from top left of visualization to drop at
 */
export function dragToVisualization(type, left, top) {
  // drag a new element in
  var element = $("[data-element-type='" + type + "']");

  var screenOffset = element.offset();
  var mousedown = $.Event("mousedown", {
    which: 1,
    pageX: screenOffset.left,
    pageY: screenOffset.top
  });
  element.trigger(mousedown);

  var drag = $.Event("mousemove", {
    pageX: $("#visualization").offset().left + left,
    pageY: $("#visualization").offset().top + top
  });
  $(document).trigger(drag);

  // when we start our drag, it positions the dragged element to be centered
  // on our cursor. adjust the target drop location accordingly
  var halfWidth = $('.draggingParent').width() / 2;
  var drag2 = $.Event("mousemove", {
    pageX: $("#visualization").offset().left + left + halfWidth,
    pageY: $("#visualization").offset().top + top
  });
  $(document).trigger(drag2);

  var mouseup = $.Event('mouseup', {
    pageX: $("#visualization").offset().left + left + halfWidth,
    pageY: $("#visualization").offset().top + top
  });
  $(document).trigger(mouseup);
}

/**
 * From: http://marcgrabanski.com/simulating-mouse-click-events-in-javascript
 * Creates a mouse event of the given type with the given clientX/clientY
 * @param {string} type
 * @param {number} clientX
 * @param {number} clientY
 */
export function createMouseEvent(type, clientX, clientY) {
  var evt;
  var e = {
    bubbles: true,
    cancelable: (type !== "mousemove"),
    view: window,
    detail: 0,
    screenX: undefined,
    screenY: undefined,
    clientX: clientX,
    clientY: clientY,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    relatedTarget: undefined
  };
  if (typeof( document.createEvent ) === "function") {
    evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(type,
      e.bubbles, e.cancelable, e.view, e.detail,
      e.screenX, e.screenY, e.clientX, e.clientY,
      e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
      e.button, document.body.parentNode);
  } else if (document.createEventObject) {
    evt = document.createEventObject();
    for (var prop in e) {
      evt[prop] = e[prop];
    }
    evt.button = { 0:1, 1:4, 2:2 }[evt.button] || evt.button;
  }
  return evt;
}

/**
 * Creates a key event of the given type with the additional parameters
 * @param {string} type (keydown, keyup, keypress)
 * @param {obj} keyConfig
 */
export function createKeyEvent(type, keyConfig) {
  // Need to use generic "Event" instead of "KeyboardEvent" because of
  // http://stackoverflow.com/questions/961532/firing-a-keyboard-event-in-javascript#comment-44022523
  var keyboardEvent = new Event(type);
  keyboardEvent.which = keyConfig.which;
  keyboardEvent.keyCode = keyConfig.keyCode;
  keyboardEvent.altKey = keyConfig.altKey;
  keyboardEvent.metaKey = keyConfig.metaKey;
  keyboardEvent.ctrlKey = keyConfig.ctrlKey;
  keyboardEvent.shiftKey = keyConfig.shiftKey;

  return keyboardEvent;
}

/**
 * Append text to the ace editor
 */
export function typeAceText(text) {
  var aceEditor = window.__TestInterface.getDroplet().aceEditor;
  aceEditor.textInput.focus();
  aceEditor.onTextInput(text);
}

/**
 * Set the Ace editor text to the given text
 */
export function setAceText(text) {
  var aceEditor = window.__TestInterface.getDroplet().aceEditor;
  aceEditor.textInput.focus();
  aceEditor.setValue(text);
}

/**
 * Given a function with n required boolean arguments, invokes the
 * function 2^n times, once with every possible permutation of arguments.
 * If the given function has no arguments it will be invoked once.
 * @param {function} fn
 * @example
 *   forEveryBooleanPermutation((a, b) => {
 *     console.log(a, b);
 *   });
 *   // Runs four times, logging:
 *   // false, false
 *   // false, true
 *   // true, false
 *   // true, true
 */
export function forEveryBooleanPermutation(fn) {
  const argCount = fn.length;
  const numPermutations = Math.pow(2, argCount);
  for (let i = 0; i < numPermutations; i++) {
    fn.apply(null, getBooleanPermutation(i, argCount));
  }
}

function getBooleanPermutation(n, numberOfBooleans) {
  return zeroPadLeft(n.toString(2), numberOfBooleans) // Padded binary string
      .split('') // to array of '0' and '1'
      .map(x => x === '1'); // to array of booleans
}

function zeroPadLeft(string, desiredWidth) {
  return ('0'.repeat(desiredWidth) + string).slice(-desiredWidth);
}

/**
 * Gets a stack trace for the current location. Phantomjs doesn't add the stack
 * property unless the exception is thrown, thus we need to throw/catch a generic error.
 */
function getStack() {
  let stack;
  try {
    throw new Error();
  } catch (e) {
    stack = e.stack;
  }
  return stack;
}

/**
 * We want to be able to have test throw by default on console error/warning, but
 * also be able to allow these calls in specific tests. This method creates two
 * functions associated with the given console method (i.e. console.warn and
 * console.error). The first method - throwEverywhere - causes us to throw any
 * time the console method in question is called in this test scope. The second
 * method - allow - overrides that behavior, allowing calls to the console method.
 */
function throwOnConsoleEverywhere(methodName) {
  let throwing = true;
  let firstInstance = null;

  return {
    // Method that will stub console[methodName] during each test and throw after
    // the test completes if it was called.
    throwEverywhere() {
      beforeEach(function () {
        // Stash test title so that we can include it in any errors
        let testTitle;
        if (this.currentTest) {
          testTitle = this.currentTest.title;
        }

        sinon.stub(console, methodName).callsFake(msg => {
          const prefix = throwing ? '' : '[ignoring]';
          console[methodName].wrappedMethod(prefix, msg);

          // Store error so we can throw in after. This will ensure we hit a failure
          // even if message was originally thrown in async code
          if (throwing && !firstInstance) {
            // It seems that format(msg) might be causing calls to console.error itself
            // Unstub so that those dont go through our stubbed console.error
            console[methodName].restore();

            firstInstance = new Error(`Call to console.${methodName} from "${testTitle}": ${format(msg)}\n${getStack()}`);
          }
        });
      });

      // After the test, throw an error if we called the console method.
      afterEach(function () {
        if (console[methodName].restore) {
          console[methodName].restore();
        }
        if (firstInstance) {
          throw new Error(firstInstance);
        }
        firstInstance = null;
      });
    },

    // Method to be called in tests that want console[methodName] to be called without
    // failure
    allow() {
      beforeEach(() => throwing = false);
      afterEach(() => throwing = true);
    }
  };
}

// Create/export methods for both console.error and console.warn
const consoleErrorFunctions = throwOnConsoleEverywhere('error');
export const throwOnConsoleErrorsEverywhere = consoleErrorFunctions.throwEverywhere;
export const allowConsoleErrors = consoleErrorFunctions.allow;

const consoleWarningFunctions = throwOnConsoleEverywhere('warn');
export const throwOnConsoleWarningsEverywhere = consoleWarningFunctions.throwEverywhere;
export const allowConsoleWarnings = consoleWarningFunctions.allow;

const originalWindowValues = {};
export function replaceOnWindow(key, newValue) {
  if (originalWindowValues.hasOwnProperty(key)) {
    throw new Error(`Can't replace 'window.${key}' - it's already been replaced.`);
  }
  originalWindowValues[key] = window[key];
  window[key] = newValue;
}

export function restoreOnWindow(key) {
  if (!originalWindowValues.hasOwnProperty(key)) {
    throw new Error(`Can't restore 'window.${key}' - it wasn't replaced.`);
  }
  window[key] = originalWindowValues[key];
  delete originalWindowValues[key];
}

/**
 * Saves the contents of `document.body.innerHTML` before each test, and
 * restores those contents after the test, allowing tests to do (almost)
 * whatever they want with elements in the document body without worrying
 * about cleanup.
 *
 * This is a big hammer and should be used sparingly - if you can write
 * components that do precise setup and tear-down, you should.  In a few cases,
 * though, this is the quickest path to test coverage.
 *
 * Warning: This can cause issues with event handlers.  Handlers attached
 * to elements within the body will go away because their targets go away,
 * but handlers attached to body, document, or window will persist - and may
 * depend on DOM that gets removed during cleanup.
 */
export function sandboxDocumentBody() {
  let originalDocumentBody;
  beforeEach(() => originalDocumentBody = document.body.innerHTML);
  afterEach(() => document.body.innerHTML = originalDocumentBody);
}

/**
 * Track whenever we create a timeout/interval, and then clear all timeouts/intervals
 * upon completion of each test.
 */
export function clearTimeoutsBetweenTests() {
  let timeoutList = [];
  let intervalList = [];
  const leftover = [];

  const setTimeoutNative = window.setTimeout;
  const setIntervalNative = window.setInterval;
  const clearTimeoutNative = window.clearTimeout;
  const clearIntervalNative = window.clearInterval;

  window.setTimeout = (...args) => {
    const result = setTimeoutNative(...args);
    timeoutList.push(result);
    return result;
  };

  window.setInterval = (...args) => {
    const result = setIntervalNative(...args);
    intervalList.push(result);
    return result;
  };

  window.clearTimeout = id => {
    const index = timeoutList.indexOf(id);
    if (index !== -1) {
      timeoutList.splice(index, 1);
    }
    return clearTimeoutNative(id);
  };

  window.clearInterval = id => {
    const index = intervalList.indexOf(id);
    if (index !== -1) {
      intervalList.splice(index, 1);
    }
    return clearIntervalNative(id);
  };

  afterEach(function () {
    // Guard carefully here, because arrow functions can steal our test context
    // and prevent us from grabbing the test name.
    const testName = this && this.currentTest && this.currentTest.fullTitle();

    timeoutList.forEach(id => {
      if (testName) {
        leftover.push('(timeout)  ' + testName);
      } else {
        // When we don't know the test name, also print a note inline to help
        // with debugging.
        leftover.push('(timeout)  Unknown test');
        console.log('clearing leftover timeout');
      }
      clearTimeoutNative(id);
    });
    intervalList.forEach(id => {
      if (testName) {
        leftover.push('(interval) ' + testName);
      } else {
        // When we don't know the test name, also print a note inline to help
        // with debugging.
        leftover.push('(interval) Unknown test');
        console.log('clearing leftover interval');
      }
      clearIntervalNative(id);
    });
    timeoutList = [];
    intervalList = [];
  });

  after(() => {
    console.log('Leftover timeouts/intervals: ' + leftover.length);
    // Uncomment if you want to see the whole list of leftover timeouts
    // console.log(leftover.map(s => '    ' + s).join('\n'));
  });
}

/**
 * This helper checks that changes to document.body are undone before the tests
 * are finished.  In particular, it enforces two rules:
 *
 * - document.body.innerHTML is the same after the tests as it was before them.
 * - document.body.removeEventListener is called the same number of times as
 *   document.body.addEventListener.
 *
 * This doesn't 100% ensure cleanup, but it catches a lot of cases.  Feel free
 * to extend this function with more rules if you think of them.
 *
 * It's recommended to include this helper in the top-level describe of a test
 * suite.
 *
 * @param {boolean} [checkEveryTest=false] If set, the cleanup assertions will
 *   be run after _every_ test, instead of just once at the end of the whole
 *   suite.  This should normally be 'false' to avoid unneeded impact on the
 *   runtime of the suite, but setting it 'true' is very useful for isolating
 *   the test that's causing related failures.
 * @param {function} runTestCases callback function containing the tests to run
 *   with the body cleanup check in place.
 */
export function enforceDocumentBodyCleanup({checkEveryTest = false}, runTestCases) {
  let initialInnerHTML;
  const beforeFn = checkEveryTest ? beforeEach : before;
  const afterFn = checkEveryTest ? afterEach : after;

  // The additional describe calls ensure correct ordering of the
  // before/after steps relative to other test steps.
  describe('', () => {
    beforeFn(() => {
      if (!initialInnerHTML) {
        initialInnerHTML = document.body.innerHTML;
      }
      sinon.spy(document.body, 'addEventListener');
      sinon.spy(document.body, 'removeEventListener');
    });

    afterFn(() => {
      if (initialInnerHTML !== document.body.innerHTML) {
        throw new Error(
          'Test modified document.body.innerHTML:' +
          '\n\nInitial:\n' +
          initialInnerHTML +
          '\n\nAfter:\n' +
          document.body.innerHTML
        );
      }

      if (document.body.addEventListener.callCount !== document.body.removeEventListener.callCount) {
        throw new Error(
          'Added ' + document.body.addEventListener.callCount + ' event listener(s)' +
          ' to document.body, but only removed ' + document.body.removeEventListener.callCount + ' listeners'
        );
      }
      document.body.addEventListener.restore();
      document.body.removeEventListener.restore();
    });

    describe('', runTestCases);
  });
}
