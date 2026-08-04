import $ from 'jquery';

jest.mock('@cdo/apps/util/moderateImage', () => ({
  moderateImageUrl: jest.fn(),
}));

import applabCommands, {
  rgb,
  setSelectionRange,
  openUrl,
} from '@cdo/apps/applab/commands';
import {injectErrorHandler} from '@cdo/apps/lib/util/javascriptMode';
import {moderateImageUrl} from '@cdo/apps/util/moderateImage';

async function flushModerationAsync() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('setProperty image URL moderation', () => {
  const mockModerateImageUrl = moderateImageUrl;
  let errorHandler;
  let originalApplab;
  let testDivApplab;
  let testImage;

  beforeEach(() => {
    jest.clearAllMocks();
    mockModerateImageUrl.mockResolvedValue('flagged');
    errorHandler = {
      outputWarning: jest.fn(),
      getAsyncOutputWarning: jest.fn(),
    };
    errorHandler.getAsyncOutputWarning.mockReturnValue(
      errorHandler.outputWarning
    );
    injectErrorHandler(errorHandler);

    originalApplab = global.Applab;
    global.Applab = {
      updateProperty: jest.fn(),
    };

    testDivApplab = document.createElement('div');
    testDivApplab.setAttribute('id', 'divApplab');
    document.body.appendChild(testDivApplab);

    testImage = document.createElement('img');
    testImage.setAttribute('id', 'test-image');
    testDivApplab.appendChild(testImage);
  });

  afterEach(() => {
    document.body.removeChild(testDivApplab);
    global.Applab = originalApplab;
    injectErrorHandler(null);
  });

  it('does not update property when absolute image URL is flagged', async () => {
    applabCommands.setProperty({
      elementId: 'test-image',
      property: 'image',
      value: 'http://example.com/image.png',
    });
    await flushModerationAsync();

    expect(mockModerateImageUrl).toHaveBeenCalledWith(
      'https://example.com/image.png',
      'applab',
      {
        uploaderType: 'ImageURLInput',
        assetUrl: 'https://example.com/image.png',
      }
    );
    expect(global.Applab.updateProperty).not.toHaveBeenCalled();
    expect(errorHandler.outputWarning).toHaveBeenCalled();
  });

  it('does not update property when moderation is unavailable', async () => {
    mockModerateImageUrl.mockResolvedValue('error');
    applabCommands.setProperty({
      elementId: 'test-image',
      property: 'image',
      value: 'http://example.com/image.png',
    });
    await flushModerationAsync();

    expect(global.Applab.updateProperty).not.toHaveBeenCalled();
    expect(errorHandler.outputWarning).toHaveBeenCalled();
  });
});

describe('other image command URL moderation', () => {
  const mockModerateImageUrl = moderateImageUrl;
  let errorHandler;
  let originalApplab;
  let testDivApplab;
  let testScreen;
  let testImage;
  let testCanvas;

  function expectModerationCalledWithHttpUrl() {
    expect(mockModerateImageUrl).toHaveBeenCalledWith(
      'https://example.com/image.png',
      'applab',
      {
        uploaderType: 'ImageURLInput',
        assetUrl: 'https://example.com/image.png',
      }
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockModerateImageUrl.mockResolvedValue('flagged');
    errorHandler = {
      outputWarning: jest.fn(),
      getAsyncOutputWarning: jest.fn(),
    };
    errorHandler.getAsyncOutputWarning.mockReturnValue(
      errorHandler.outputWarning
    );
    injectErrorHandler(errorHandler);

    originalApplab = global.Applab;
    testCanvas = document.createElement('canvas');
    testCanvas.width = 320;
    testCanvas.height = 480;
    testCanvas.getContext = jest.fn().mockReturnValue({
      save: jest.fn(),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      restore: jest.fn(),
    });
    global.Applab = {
      updateProperty: jest.fn(),
      activeCanvas: testCanvas,
      activeScreen: jest.fn(),
    };

    testDivApplab = document.createElement('div');
    testDivApplab.setAttribute('id', 'divApplab');
    document.body.appendChild(testDivApplab);

    testScreen = document.createElement('div');
    testScreen.setAttribute('id', 'screen1');
    testDivApplab.appendChild(testScreen);
    global.Applab.activeScreen.mockReturnValue(testScreen);

    testImage = document.createElement('img');
    testImage.setAttribute('id', 'test-image');
    testDivApplab.appendChild(testImage);
  });

  afterEach(() => {
    document.body.removeChild(testDivApplab);
    global.Applab = originalApplab;
    injectErrorHandler(null);
  });

  it('image warns and leaves src empty when absolute URL is flagged', async () => {
    applabCommands.image({
      elementId: 'new-image',
      src: 'http://example.com/image.png',
    });
    await flushModerationAsync();

    expectModerationCalledWithHttpUrl();
    expect(errorHandler.outputWarning).toHaveBeenCalled();
    const createdImage = document.getElementById('new-image');
    expect(createdImage).toBeTruthy();
    expect(createdImage.getAttribute('data-canonical-image-url')).toBeNull();
  });

  it('setImageURL warns and leaves src unchanged when moderation is unavailable', async () => {
    mockModerateImageUrl.mockResolvedValue('error');
    const originalSrc = testImage.src;
    applabCommands.setImageURL({
      elementId: 'test-image',
      src: 'http://example.com/image.png',
    });
    await flushModerationAsync();

    expectModerationCalledWithHttpUrl();
    expect(errorHandler.outputWarning).toHaveBeenCalled();
    expect(testImage.src).toBe(originalSrc);
    expect(testImage.getAttribute('data-canonical-image-url')).toBeNull();
  });

  it('drawImageURL warns and invokes callback(false) when absolute URL is flagged', async () => {
    const callback = jest.fn();
    applabCommands.drawImageURL({
      url: 'http://example.com/image.png',
      callback,
    });
    await flushModerationAsync();

    expectModerationCalledWithHttpUrl();
    expect(errorHandler.outputWarning).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(false);
  });

  it('drawImageURL warns and invokes callback(false) when moderation is unavailable', async () => {
    mockModerateImageUrl.mockResolvedValue('error');
    const callback = jest.fn();
    applabCommands.drawImageURL({
      url: 'http://example.com/image.png',
      callback,
    });
    await flushModerationAsync();

    expectModerationCalledWithHttpUrl();
    expect(errorHandler.outputWarning).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(false);
  });
});

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
