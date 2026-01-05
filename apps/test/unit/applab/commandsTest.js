import $ from 'jquery';

import Applab from '@cdo/apps/applab/applab';
import {
  rgb,
  setSelectionRange,
  openUrl,
  getElementIds,
} from '@cdo/apps/applab/commands';
import * as constants from '@cdo/apps/applab/constants';
import {injectErrorHandler} from '@cdo/apps/lib/util/javascriptMode';

describe('rgb command', () => {
  it('returns an rgba string with no alpha', function () {
    const opts = {r: 255, g: 0, b: 75};
    expect(rgb(opts)).toBe('rgba(255, 0, 75, 1)');
  });

  it('returns an rgba string with alpha', function () {
    const alphaOpts = {r: 255, g: 0, b: 75, a: 0.5};
    expect(rgb(alphaOpts)).toBe('rgba(255, 0, 75, 0.5)');
  });

  it('handles values outside of 0 - 255', function () {
    const alphaOpts = {r: -10, g: 300, b: 75, a: 0.5};
    expect(rgb(alphaOpts)).toBe('rgba(0, 255, 75, 0.5)');
  });

  it('handles decimal values', function () {
    const alphaOpts = {r: 0, g: 200.5, b: 75, a: 0.5};
    expect(rgb(alphaOpts)).toBe('rgba(0, 201, 75, 0.5)');
  });
});

describe('setSelectionRange', () => {
  let errorHandler, testDivApplab, testInput, testInputId;

  beforeEach(() => {
    errorHandler = {
      outputWarning: jest.fn(),
    };
    injectErrorHandler(errorHandler);

    testDivApplab = document.createElement('div');
    testDivApplab.setAttribute('id', 'divApplab');
    document.body.appendChild(testDivApplab);

    testInputId = 'test-input';
    testInput = document.createElement('input');
    testInput.setAttribute('id', testInputId);
    testInput.setAttribute('type', 'text');
    testInput.setAttribute('value', 'example content');
    testDivApplab.appendChild(testInput);
  });

  afterEach(() => {
    document.body.removeChild(testDivApplab);
    injectErrorHandler(null);
  });

  it('sets the selection range on the found element', () => {
    expect(testInput.selectionStart).toBe(0);
    expect(testInput.selectionEnd).toBe(0);
    setSelectionRange({
      elementId: testInputId,
      selectionStart: 3,
      selectionEnd: 6,
    });
    expect(testInput.selectionStart).toBe(3);
    expect(testInput.selectionEnd).toBe(6);
  });

  it('sets the selection direction on the found element', () => {
    testInput.selectionDirection = 'forward';
    expect(testInput.selectionDirection).toBe('forward');
    setSelectionRange({
      elementId: testInputId,
      selectionStart: 3,
      selectionEnd: 6,
      selectionDirection: 'backward',
    });
    expect(testInput.selectionDirection).toBe('backward');
  });

  it('warns if element is not found', () => {
    setSelectionRange({
      elementId: 'fakeElementId',
      selectionStart: 0,
      selectionEnd: 0,
    });
    expect(errorHandler.outputWarning).toHaveBeenCalledWith(
      'The setSelectionRange() elementId parameter refers to ' +
        'an id ("fakeElementId") which does not exist.'
    );
  });

  it('warns if start is not a number', () => {
    setSelectionRange({
      elementId: testInputId,
      selectionStart: 'string',
      selectionEnd: 0,
    });
    expect(errorHandler.outputWarning).toHaveBeenCalledWith(
      'setSelectionRange() start parameter value (string) is not a number.'
    );
  });

  it('warns if end is not a number', () => {
    setSelectionRange({
      elementId: testInputId,
      selectionStart: 0,
      selectionEnd: 'string',
    });
    expect(errorHandler.outputWarning).toHaveBeenCalledWith(
      'setSelectionRange() end parameter value (string) is not a number.'
    );
  });

  it('warns if direction is not a string', () => {
    setSelectionRange({
      elementId: testInputId,
      selectionStart: 0,
      selectionEnd: 0,
      selectionDirection: () => {},
    });
    expect(errorHandler.outputWarning).toHaveBeenCalledWith(
      'setSelectionRange() direction parameter value (function) is not a string.'
    );
  });
});

describe('openUrl', () => {
  let errorHandler;

  beforeEach(() => {
    errorHandler = {
      outputWarning: jest.fn(),
    };
    injectErrorHandler(errorHandler);
    jest.spyOn(window, 'open').mockClear();
    jest
      .spyOn($, 'ajax')
      .mockClear()
      .mockImplementation(() => {
        return {
          success() {
            return {
              fail() {},
            };
          },
        };
      });
  });

  afterEach(() => {
    injectErrorHandler(null);
    $.ajax.mockRestore();
    window.open.mockRestore();
  });

  it('fails if given a non-string url', () => {
    openUrl({url: 42});

    expect(errorHandler.outputWarning).toHaveBeenCalledWith(
      'openUrl() url parameter value (42) is not a string.'
    );
  });

  it('opens new tab for "studio.code.org" and "code.org" links', () => {
    openUrl({url: 'https://studio.code.org/'});
    expect(window.open).toHaveBeenCalledTimes(1);
    openUrl({url: 'http://code.org/'});
    expect(window.open).toHaveBeenCalledTimes(2);
    openUrl({url: 'www.studio.code.org/'});
    expect(window.open).toHaveBeenCalledTimes(3);
    expect($.ajax).not.toHaveBeenCalled();
  });

  it('triggers a call to filterURL for an external link', () => {
    openUrl({url: 'www.google.com'});
    expect($.ajax).toHaveBeenCalledTimes(1);
    openUrl({url: 'code.org.otherdomain.com'});
    expect($.ajax).toHaveBeenCalledTimes(2);
  });
});

describe('getElementIds', () => {
  let testDivApplab, designModeViz, screen, button, label;

  beforeEach(() => {
    // Set up the DOM structure that App Lab uses
    testDivApplab = document.createElement('div');
    testDivApplab.setAttribute('id', 'divApplab');
    document.body.appendChild(testDivApplab);

    designModeViz = document.createElement('div');
    designModeViz.setAttribute('id', 'designModeViz');
    testDivApplab.appendChild(designModeViz);

    screen = document.createElement('div');
    screen.setAttribute('class', 'screen');
    screen.setAttribute('id', constants.DESIGN_ELEMENT_ID_PREFIX + 'screen1');
    screen.style.display = 'block'; // Make it the active screen
    designModeViz.appendChild(screen);

    button = document.createElement('button');
    button.setAttribute('id', constants.DESIGN_ELEMENT_ID_PREFIX + 'button1');
    screen.appendChild(button);

    label = document.createElement('label');
    label.setAttribute('id', constants.DESIGN_ELEMENT_ID_PREFIX + 'label1');
    screen.appendChild(label);

    // Mock the Applab object with the method we need
    window.Applab = Applab;
  });

  afterEach(() => {
    document.body.removeChild(testDivApplab);
  });

  it('returns an array of element IDs on the current screen', () => {
    const result = getElementIds({});
    expect(Array.isArray(result)).toBe(true);
    expect(result).toContain('screen1');
    expect(result).toContain('button1');
    expect(result).toContain('label1');
  });

  it('returns element IDs without the design_ prefix', () => {
    const result = getElementIds({});
    result.forEach(id => {
      expect(id).not.toContain('design_');
    });
  });
});
