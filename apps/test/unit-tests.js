import '@babel/polyfill/noConflict';
import 'whatwg-fetch';
import {throwOnConsoleErrorsEverywhere} from './util/throwOnConsole';
import {clearTimeoutsBetweenTests} from './util/clearTimeoutsBetweenTests';
import Adapter from 'enzyme-adapter-react-16';
import enzyme from 'enzyme';
import KARMA_CLI_FLAGS from './util/KARMA_CLI_FLAGS';

describe('unit tests', function () {
  enzyme.configure({adapter: new Adapter()});
  const testsContext = require.context('./unit', true, /\.[j|t]sx?$/);
  let runnable = testsContext.keys();

  // Invoked by `karma start --entry=./test/unit/gridUtilsTest.js`
  // Specifies a specific test file or test directory to run.
  if (KARMA_CLI_FLAGS.entry) {
    runnable = runnable.filter(path => path.startsWith(KARMA_CLI_FLAGS.entry));
  }

  throwOnConsoleErrorsEverywhere();

  // TODO: Add warnings back once redux/react-redux have been upgraded.
  // https://codedotorg.atlassian.net/browse/XTEAM-376
  // throwOnConsoleWarningsEverywhere();

  clearTimeoutsBetweenTests();
  runnable.forEach(testsContext);
});
