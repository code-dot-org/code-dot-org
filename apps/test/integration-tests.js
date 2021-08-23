import '@babel/polyfill';
import 'whatwg-fetch';
import {throwOnConsoleErrorsEverywhere} from './util/throwOnConsole';
import {clearTimeoutsBetweenTests} from './util/clearTimeoutsBetweenTests';
import stubFirehose from './util/stubFirehose';

var integrationContext = require.context('./integration', false, /Tests?\.js$/);

describe('integration tests', function() {
  throwOnConsoleErrorsEverywhere();
  // TODO: Throw on warnings once dependencies that use unsafe lifecycle hooks have been upgraded.
  // Upgrading react-inspector (~5.1 works) may be the only dependency that needs to be upgraded.
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
