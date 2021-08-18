// This gets replaced by karma webpack with the updated files on rebuild
import '@babel/polyfill';
import 'whatwg-fetch';
import {throwOnConsoleErrorsEverywhere} from './util/throwOnConsole';
import {clearTimeoutsBetweenTests} from './util/clearTimeoutsBetweenTests';
import Adapter from 'enzyme-adapter-react-16';
import enzyme from 'enzyme';
enzyme.configure({adapter: new Adapter()});

let __karmaWebpackManifest__ = [];

function inManifest(path) {
  return __karmaWebpackManifest__.indexOf(path) >= 0;
}

function filterFoormTest(path) {
  return (
    [
      './code-studio/pd/foorm/',
      './code-studio/pd/form_components/',
      './code-studio/pd/workshop_dashboard/components/survey_results/survey_rollup_table_foormTest.js',
      './code-studio/pd/workshop_dashboard/components/workshop_managementTest.js',
      './code-studio/pd/workshop_dashboard/reports/foorm/resultsTest.js'
    ].findIndex(p => path.startsWith(p)) === -1
  );
}

let testsContext = require.context('./unit', true, /\.jsx?$/);

let runnable = testsContext
  .keys()
  .filter(path => inManifest(path) || filterFoormTest(path));

// Run all tests if we didn't find any changes
if (!runnable.length) {
  runnable = testsContext.keys();
}

describe('unit tests', function() {
  throwOnConsoleErrorsEverywhere();
  clearTimeoutsBetweenTests();
  runnable.forEach(testsContext);
});
