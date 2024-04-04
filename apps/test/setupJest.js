import enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import $ from 'jquery';

enzyme.configure({adapter: new Adapter()});
window.IN_UNIT_TEST = true;
window.IN_STORYBOOK = false;

const localeMock = moduleName => {
  return new Proxy(jest.requireActual(moduleName), {
    get(target, prop) {
      if (prop !== '__esModule') {
        return jest.fn().mockReturnValue(prop);
      }

      return undefined;
    },
  });
};

jest.mock('@cdo/locale', () => {
  return localeMock('@cdo/locale');
});

jest.mock('@cdo/locale', () => {
  return localeMock('@cdo/locale');
});
jest.mock('@cdo/aichat/locale', () => {
  return localeMock('@cdo/aichat/locale');
});
jest.mock('@cdo/applab/locale', () => {
  return localeMock('@cdo/applab/locale');
});
jest.mock('@cdo/javalab/locale', () => {
  return localeMock('@cdo/javalab/locale');
});
jest.mock('@cdo/music/locale', () => {
  return localeMock('@cdo/music/locale');
});
jest.mock('@cdo/netsim/locale', () => {
  return localeMock('@cdo/netsim/locale');
});
// jest.mock('@cdo/regionalPartnerMiniContact/locale', () => {
//   return localeMock('@cdo/regionalPartnerMiniContact/locale');
// });
// jest.mock('@cdo/regionalPartnerSearch/locale', () => {
//   return localeMock('@cdo/regionalPartnerSearch/locale');
// });
jest.mock('@cdo/standaloneVideo/locale', () => {
  return localeMock('@cdo/standaloneVideo/locale');
});
jest.mock('@cdo/tutorialExplorer/locale', () => {
  return localeMock('@cdo/tutorialExplorer/locale');
});
jest.mock('@cdo/weblab/locale', () => {
  return localeMock('@cdo/weblab/locale');
});
jest.mock('@cdo/gamelab/locale', () => {
  return localeMock('@cdo/gamelab/locale');
});
jest.mock('@cdo/poetry/locale', () => {
  return localeMock('@cdo/poetry/locale');
});
jest.mock('@cdo/spritelab/locale', () => {
  return localeMock('@cdo/spritelab/locale');
});

global.$ = global.jQuery = $;
