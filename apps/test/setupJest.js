import 'whatwg-fetch';

/**
 * Import locales to jest environment
 */
import '../build/locales/en_us/common_locale.js';
import '../build/locales/en_us/aichat_locale.js';
import '../build/locales/en_us/applab_locale.js';
import '../build/locales/en_us/javalab_locale.js';
import '../build/locales/en_us/signup_locale.js';
import '../build/locales/en_us/music_locale.js';
import '../build/locales/en_us/netsim_locale.js';
import '../build/locales/en_us/standaloneVideo_locale.js';
import '../build/locales/en_us/tutorialExplorer_locale.js';
import '../build/locales/en_us/weblab_locale.js';
import '../build/locales/en_us/gamelab_locale.js';
import '../build/locales/en_us/poetry_locale.js';
import '../build/locales/en_us/spritelab_locale.js';
import '../build/locales/en_us/studio_locale.js';
import '../build/locales/en_us/craft_locale.js';
import '../build/locales/en_us/flappy_locale.js';

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import enzyme from 'enzyme'; // eslint-disable-line no-restricted-imports
import mockFetch from 'jest-fetch-mock';
import $ from 'jquery';
import {TextEncoder, TextDecoder} from 'util';

enzyme.configure({adapter: new Adapter()});
window.IN_UNIT_TEST = true;
window.IN_STORYBOOK = false;
window.scrollTo = jest.fn();
window.fetch = mockFetch;

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

Range.prototype.getBoundingClientRect = () => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
});

Range.prototype.getClientRects = () => ({
  item: () => null,
  length: 0,
  [Symbol.iterator]: jest.fn(),
});

// jQuery visibility tests (showProjectAdminTest)
// https://github.com/jsdom/jsdom/issues/1048
window.Element.prototype.getClientRects = function () {
  var node = this;
  while (node) {
    if (node === document) {
      break;
    }
    // don't know why but style is sometimes undefined
    if (
      !node.style ||
      node.style.display === 'none' ||
      node.style.visibility === 'hidden'
    ) {
      return [];
    }
    node = node.parentNode;
  }
  var self = $(this);
  return [{width: self.width(), height: self.height()}];
};

global.$ = global.jQuery = $;
global.IN_UNIT_TEST = true;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.PISKEL_DEVELOPMENT_MODE = 'false';

jest.mock('@cdo/apps/metrics/firehose', () => ({
  putRecord: jest.fn(),
}));
// Mock out toImage as it produces a live image relying on browser callbacks to properly instantiate
// imageUtils is tested in the integration test suite instead of jest.
jest.mock('@cdo/apps/imageUtils', () => ({
  ...jest.requireActual('@cdo/apps/imageUtils'),
  toImage: jest.fn(),
  dataURIToSourceSize: jest.fn(),
}));
fetch.mockIf('/api/v1/users/current', JSON.stringify(''));
