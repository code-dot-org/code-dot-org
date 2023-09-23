/* eslint-disable */
// Auto-generated from Gruntfile.js
import '@babel/polyfill/noConflict';
import 'whatwg-fetch';
import Adapter from 'enzyme-adapter-react-16';
import enzyme from 'enzyme';
enzyme.configure({adapter: new Adapter()});
import { throwOnConsoleErrorsEverywhere } from './util/throwOnConsole';

describe('entry tests', () => {
  throwOnConsoleErrorsEverywhere();

  // TODO: Add warnings back once we've run the rename-unsafe-lifecycles codemod.
  // https://codedotorg.atlassian.net/browse/XTEAM-377
  // throwOnConsoleWarningsEverywhere();

  require('/Users/seth/src/code-dot-org-esm-exports/apps/test/unit/achievementsTest.js');
});
