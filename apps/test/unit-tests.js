// This gets replaced by karma webpack with the updated files on rebuild
import 'babel-polyfill';
import { throwOnConsoleErrorsEverywhere, throwOnConsoleWarningsEverywhere } from './util/testUtils';

var __karmaWebpackManifest__ = [];

function inManifest(path) {
  return __karmaWebpackManifest__.indexOf(path) >= 0;
}


var testsContext = require.context("./unit", true, /\.jsx?$/);

var runnable = testsContext.keys().filter(inManifest);

// Run all tests if we didn't find any changes
if (!runnable.length) {
  runnable = testsContext.keys();
}

describe('unit tests', () => {
  throwOnConsoleErrorsEverywhere();
  throwOnConsoleWarningsEverywhere();
  runnable.forEach(testsContext);
});
