import React from 'react';
import $ from 'jquery';
import sinon from 'sinon';
const project = require('@cdo/apps/code-studio/initApp/project');
const assets = require('@cdo/apps/code-studio/assets');
export {
  throwOnConsoleErrorsEverywhere,
  throwOnConsoleWarningsEverywhere,
  allowConsoleErrors,
  allowConsoleWarnings
} from './throwOnConsole';
export {clearTimeoutsBetweenTests} from './clearTimeoutsBetweenTests';

export function setExternalGlobals(beforeFunc = before, afterFunc = after) {
  // Temporary: Provide React on window while we still have a direct dependency
  // on the global due to a bad code-studio/apps interaction.
  window.React = React;
  window.dashboard = {...window.dashboard, assets, project};

  beforeFunc(() => {
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
  return (
    location.search
      .substring(1)
      .split('&')
      .indexOf('debug') !== -1
  );
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
  var mousedown = $.Event('mousedown', {
    which: 1,
    pageX: screenOffset.left,
    pageY: screenOffset.top
  });
  element.trigger(mousedown);

  var drag = $.Event('mousemove', {
    pageX: $('#visualization').offset().left + left,
    pageY: $('#visualization').offset().top + top
  });
  $(document).trigger(drag);

  //
  // Apply border-box styling that would normally come from applab css files
  // on the element types: input, div.textArea, button, select, img, label
  //
  switch (type) {
    case 'BUTTON':
    case 'TEXT_INPUT':
    case 'TEXT_AREA':
    case 'RADIO_BUTTON':
    case 'LABEL':
    case 'SLIDER':
    case 'CHECKBOX':
    case 'DROPDOWN':
      $('.draggingParent')
        .first()
        .children()
        .first()
        .css('box-sizing', 'border-box');
      break;
    default:
      break;
  }

  // when we start our drag, it positions the dragged element to be centered
  // on our cursor. adjust the target drop location accordingly
  var halfWidth = $('.draggingParent').width() / 2;
  var drag2 = $.Event('mousemove', {
    pageX: $('#visualization').offset().left + left + halfWidth,
    pageY: $('#visualization').offset().top + top
  });
  $(document).trigger(drag2);

  var mouseup = $.Event('mouseup', {
    pageX: $('#visualization').offset().left + left + halfWidth,
    pageY: $('#visualization').offset().top + top
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
    cancelable: type !== 'mousemove',
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
  if (typeof document.createEvent === 'function') {
    evt = document.createEvent('MouseEvents');
    evt.initMouseEvent(
      type,
      e.bubbles,
      e.cancelable,
      e.view,
      e.detail,
      e.screenX,
      e.screenY,
      e.clientX,
      e.clientY,
      e.ctrlKey,
      e.altKey,
      e.shiftKey,
      e.metaKey,
      e.button,
      document.body.parentNode
    );
  } else if (document.createEventObject) {
    evt = document.createEventObject();
    for (var prop in e) {
      evt[prop] = e[prop];
    }
    evt.button = {0: 1, 1: 4, 2: 2}[evt.button] || evt.button;
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

const originalWindowValues = {};
export function replaceOnWindow(key, newValue) {
  if (originalWindowValues.hasOwnProperty(key)) {
    throw new Error(
      `Can't replace 'window.${key}' - it's already been replaced.`
    );
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
  beforeEach(() => (originalDocumentBody = document.body.innerHTML));
  afterEach(() => (document.body.innerHTML = originalDocumentBody));
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
export function enforceDocumentBodyCleanup(
  {checkEveryTest = false},
  runTestCases
) {
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

      if (
        document.body.addEventListener.callCount !==
        document.body.removeEventListener.callCount
      ) {
        throw new Error(
          'Added ' +
            document.body.addEventListener.callCount +
            ' event listener(s)' +
            ' to document.body, but only removed ' +
            document.body.removeEventListener.callCount +
            ' listeners'
        );
      }
      document.body.addEventListener.restore();
      document.body.removeEventListener.restore();
    });

    describe('', runTestCases);
  });
}

/**
 * Call in the `describe` block for a group of tests to stub the value of window.dashboard safely.
 * @param {object} value - The temporary value for window.dashboard
 * @example
 *   describe('example', () => {
 *     stubWindowDashboard({
 *       CODE_ORG_URL: '//test.code.org'
 *     });
 *
 *     it('stubs the value', () => {
 *       assert.equal('//test.code.org', window.dashboard.CODE_ORG_URL);
 *     });
 *   });
 */
export function stubWindowDashboard(value) {
  let originalDashboard;
  before(() => (originalDashboard = window.dashboard));
  after(() => (window.dashboard = originalDashboard));
  beforeEach(() => (window.dashboard = value));
}

/**
 * Call in the `describe` block for a group of tests to stub the value of window.pegasus safely.
 * @param {object} value - The temporary value for window.pegasus
 * @example
 *   describe('example', () => {
 *     stubWindowPegasus({
 *       STUDIO_URL: '//test-studio.code.org'
 *     });
 *
 *     it('stubs the value', () => {
 *       assert.equal('//test-studio.code.org', window.dashboard.STUDIO_URL);
 *     });
 *   });
 */
export function stubWindowPegasus(value) {
  let originalPegasus;
  before(() => (originalPegasus = window.pegasus));
  after(() => (window.pegasus = originalPegasus));
  beforeEach(() => (window.pegasus = value));
}
