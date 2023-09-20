import '@babel/polyfill/noConflict';
import 'whatwg-fetch';
import {throwOnConsoleErrorsEverywhere} from './util/throwOnConsole';
import {clearTimeoutsBetweenTests} from './util/clearTimeoutsBetweenTests';
import stubFirehose from './util/stubFirehose';

describe('integration tests', function () {
  var testsContext = require.context('./integration', false, /Tests?\.js$/);

  throwOnConsoleErrorsEverywhere();

  // TODO: Add warnings back once redux/react-redux and react-inspector have been upgraded.
  // redux: https://codedotorg.atlassian.net/browse/XTEAM-376
  // react-inspector: https://codedotorg.atlassian.net/browse/XTEAM-375
  // throwOnConsoleWarningsEverywhere();

  clearTimeoutsBetweenTests();
  stubFirehose();

  testsContext.keys().forEach(testsContext);
});
