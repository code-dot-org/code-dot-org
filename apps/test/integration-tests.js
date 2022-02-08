import '@babel/polyfill';
import 'whatwg-fetch';
import {throwOnConsoleErrorsEverywhere} from './util/throwOnConsole';
import {clearTimeoutsBetweenTests} from './util/clearTimeoutsBetweenTests';
import stubFirehose from './util/stubFirehose';

var integrationContext = require.context('./integration', false, /Tests?\.js$/);

describe('integration tests', function() {
  throwOnConsoleErrorsEverywhere();

  // TODO: Add warnings back once redux/react-redux and react-inspector have been upgraded.
  // redux: https://codedotorg.atlassian.net/browse/XTEAM-376
  // react-inspector: https://codedotorg.atlassian.net/browse/XTEAM-375
  // throwOnConsoleWarningsEverywhere();

  clearTimeoutsBetweenTests();
  stubFirehose();
  integrationContext
    .keys()
    .filter(
      key =>
        !process.env.mocha_entry ||
        ('./test/integration' + key.slice(1)).indexOf(
          process.env.mocha_entry
        ) >= 0
    )
    .forEach(integrationContext);
});
