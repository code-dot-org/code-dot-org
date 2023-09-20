// This gets replaced by karma webpack with the updated files on rebuild
import '@babel/polyfill/noConflict';
import 'whatwg-fetch';
import {throwOnConsoleErrorsEverywhere} from './util/throwOnConsole';
import {clearTimeoutsBetweenTests} from './util/clearTimeoutsBetweenTests';
import Adapter from 'enzyme-adapter-react-16';
import enzyme from 'enzyme';
import KARMA_CLI_FLAGS from './util/KARMA_CLI_FLAGS';
enzyme.configure({adapter: new Adapter()});

var __karmaWebpackManifest__ = [];

function inManifest(path) {
  return __karmaWebpackManifest__.indexOf(path) >= 0;
}

var testsContext = require.context('./unit', true, /\.[j|t]sx?$/);

var runnable = testsContext.keys().filter(inManifest);

// Run all tests if we didn't find any changes
if (!runnable.length) {
  runnable = testsContext.keys();
}

// Invoked by `karma start --entry=./test/unit/gridUtilsTest.js`
// Specifies a specific test file or test directory to run.
if (KARMA_CLI_FLAGS.entry) {
  runnable = runnable.filter(path => path.startsWith(KARMA_CLI_FLAGS.entry));
}

describe('unit tests', function () {
  throwOnConsoleErrorsEverywhere();

  // TODO: Add warnings back once redux/react-redux have been upgraded.
  // https://codedotorg.atlassian.net/browse/XTEAM-376
  // throwOnConsoleWarningsEverywhere();

  clearTimeoutsBetweenTests();
  runnable.forEach(testsContext);
});
