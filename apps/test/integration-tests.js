import 'babel-polyfill';
import { throwOnConsoleErrorsEverywhere, throwOnConsoleWarningsEverywhere } from './util/testUtils';


var integrationContext = require.context("./integration", false, /Tests?\.js$/);

describe('integration tests', () => {
  throwOnConsoleErrorsEverywhere();
  throwOnConsoleWarningsEverywhere();
  integrationContext.keys()
    .filter(
          key => !process.env.mocha_entry ||
        ('./test/integration'+key.slice(1)).indexOf(process.env.mocha_entry) >= 0
    )
    .forEach(integrationContext);
});
